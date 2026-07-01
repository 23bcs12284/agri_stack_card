import type { FarmerData, LandRecord } from '../context/FarmerContext';
import type { PDFTextItem } from './pdfExtractor';

/* ──────────────────────────────────────────────────────────────────────────────
 *  Deterministic parser for the Government Farmer Registry PDF template.
 *
 *  Approach:
 *  1. Extract text items with x/y coordinates from PDF.js
 *  2. Group items into visual rows by Y proximity
 *  3. Build cells within each row (8pt gap = new cell)
 *  4. For each known field label, find the value that follows it
 *  5. For the land table, use column X-positions from the header row
 *
 *  Key invariant: This parser is specific to the Farmer Registry template.
 *  Every uploaded PDF follows the same layout.
 * ────────────────────────────────────────────────────────────────────────────── */

interface RowCell {
  text: string;
  x: number;
  startX: number;
}

/* ── Normalise text for label matching ────────────────────────────────────── */
function normalizeForMatch(value: string): string {
  return value
    .replace(/[\u2018\u2019\u201C\u201D''""]/g, '')   // Strip all curly & straight quotes
    .replace(/[^a-zA-Z0-9\u0900-\u097F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/* ── Strip curly quotes from raw cell text so indexOf works ───────────────── */
function stripCurlyQuotes(text: string): string {
  return text
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"');
}

/* ── Build cells from sorted PDF items on the same row ───────────────────── */
function buildRowCells(items: PDFTextItem[]): RowCell[] {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const cells: RowCell[] = [];
  if (sorted.length === 0) return cells;

  let currentCell: RowCell = { text: sorted[0].str, x: sorted[0].x, startX: sorted[0].x };
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    const gap = cur.x - (prev.x + prev.width);
    if (gap >= 8) {
      cells.push(currentCell);
      currentCell = { text: cur.str, x: cur.x, startX: cur.x };
    } else if (gap >= 1.0) {
      currentCell.text += ` ${cur.str}`;
    } else {
      currentCell.text += cur.str;
    }
  }
  cells.push(currentCell);
  return cells.filter((c) => c.text.trim());
}

/* ── Group PDF items into rows by Y proximity ─────────────────────────────── */
function groupIntoRows(items: PDFTextItem[]): RowCell[][] {
  if (items.length === 0) return [];

  const sorted = [...items].sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 3) return yDiff;
    return a.x - b.x;
  });

  const yLines: PDFTextItem[][] = [];
  let currentLine: PDFTextItem[] = [sorted[0]];
  let lastY = sorted[0].y;

  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].y - lastY) <= 3) {
      currentLine.push(sorted[i]);
    } else {
      yLines.push(currentLine);
      currentLine = [sorted[i]];
      lastY = sorted[i].y;
    }
  }
  yLines.push(currentLine);

  return yLines.map((lineItems) => buildRowCells(lineItems)).filter((r) => r.length > 0);
}

/* ── Known field labels and their stop-labels ─────────────────────────────── *
 *  Each field's value starts after its own label and ends before the
 *  next field's label begins. This prevents label–value concatenation.      */
interface FieldDef {
  key: string;
  startLabels: string[];   // label text that precedes the value
  stopLabels: string[];    // label text that marks end of value (next field)
  crossRow?: boolean;      // value may be on the next row
  stripColon?: boolean;    // strip trailing colon from remainder
}

const FIELD_DEFS: FieldDef[] = [
  {
    key: 'enrollmentId',
    startLabels: ['farmer enrollment number'],
    stopLabels: ['farmer photograph', 'farmer details'],
    crossRow: true,
    stripColon: true,
  },
  {
    key: 'farmerName',
    startLabels: ['farmer name as per aadhaar in english'],
    stopLabels: ['farmers name in local language', 'farmer name in local language', 'gender'],
  },
  {
    key: 'hindiName',
    startLabels: ['farmers name in local language', 'farmer name in local language'],
    stopLabels: ['gender', 'date of birth'],
  },
  {
    key: 'gender',
    startLabels: ['gender'],
    stopLabels: ['caste category', 'category', 'date of birth'],
  },
  {
    key: 'category',
    startLabels: ['caste category', 'social category'],
    stopLabels: ['date of birth', 'age', 'gender'],
  },
  {
    key: 'dob',
    startLabels: ['date of birth'],
    stopLabels: ['age'],
  },
  {
    key: 'age',
    startLabels: ['age'],
    stopLabels: ['identifier', 'contact', 'mobile'],
  },
  {
    key: 'identifierName',
    startLabels: ['identifier name in english'],
    stopLabels: ['identifier name in local language', 'contact'],
  },
  {
    key: 'identifierLocalName',
    startLabels: ['identifier name in local language'],
    stopLabels: ['contact', 'mobile'],
  },
  {
    key: 'mobile',
    startLabels: ['mobile number'],
    stopLabels: ['email', 'farmer bank', 'address'],
  },
  {
    key: 'address',
    startLabels: ['address in english'],
    stopLabels: ['address in local language', 'farmer type'],
  },
  {
    key: 'localAddress',
    startLabels: ['address in local language'],
    stopLabels: ['farmer type', 'occupations', 'land ownership'],
  },
  {
    key: 'farmerType',
    startLabels: ['farmer type'],
    stopLabels: ['occupations', 'land ownership'],
  },
];

/* ── Extract a single field value from flattened rows ─────────────────────── */
function extractFieldValue(
  rows: RowCell[][],
  field: FieldDef
): string {
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    for (let cellIdx = 0; cellIdx < row.length; cellIdx++) {
      const cell = row[cellIdx];
      const normalizedCell = normalizeForMatch(cell.text);

      // Check if this cell contains the start label
      const matchedLabel = field.startLabels.find((label) =>
        normalizedCell.includes(normalizeForMatch(label))
      );
      if (!matchedLabel) continue;

      // Found the label. Now extract the value.
      // Step 1: Check if value is embedded in the same cell after the label
      const normalizedLabelText = normalizeForMatch(matchedLabel);
      const normCellText = normalizeForMatch(cell.text);
      const labelEndPos = normCellText.indexOf(normalizedLabelText);

      if (labelEndPos >= 0) {
        // Map from normalized position back to original text position
        // Instead of indexOf on original (which fails with curly quotes),
        // we strip curly quotes from the cell text and then do indexOf
        const cleanCell = stripCurlyQuotes(cell.text);
        const cleanLabelIdx = cleanCell.toLowerCase().indexOf(matchedLabel.toLowerCase());

        let remainder = '';
        if (cleanLabelIdx >= 0) {
          remainder = cell.text.slice(cleanLabelIdx + matchedLabel.length).trim();
        } else {
          // Fallback: use the normalized positions to approximate
          const afterNorm = normCellText.slice(labelEndPos + normalizedLabelText.length).trim();
          if (afterNorm) {
            // The remainder in normalized form; try to find it in original
            remainder = cell.text.slice(cell.text.length - afterNorm.length * 2).trim();
            // Better: just split by the label pattern more carefully
            const parts = cell.text.split(/\s+/);
            const labelWordCount = matchedLabel.split(/\s+/).length;
            remainder = parts.slice(labelWordCount).join(' ').trim();
          }
        }

        // Strip colon if needed
        if (field.stripColon) {
          remainder = remainder.replace(/^[:\s]+/, '').trim();
        }

        if (remainder) {
          // Collect value from remaining cells in this row (stop at stop-label)
          const valueParts = [remainder];
          for (let nextIdx = cellIdx + 1; nextIdx < row.length; nextIdx++) {
            const nextNorm = normalizeForMatch(row[nextIdx].text);
            const isStopLabel = field.stopLabels.some((sl) =>
              nextNorm.includes(normalizeForMatch(sl))
            );
            const isAnyStartLabel = FIELD_DEFS.some((fd) =>
              fd.startLabels.some((sl) => nextNorm.includes(normalizeForMatch(sl)))
            );
            if (isStopLabel || isAnyStartLabel) break;
            valueParts.push(row[nextIdx].text.trim());
          }
          const value = valueParts.join(' ').trim();
          console.log(`  ✓ ${field.key}: "${value}" (same-cell remainder)`);
          return value;
        }
      }

      // Step 2: Value is NOT in the same cell. Look at next cells in this row first.
      const valueParts: string[] = [];
      for (let nextIdx = cellIdx + 1; nextIdx < row.length; nextIdx++) {
        const nextNorm = normalizeForMatch(row[nextIdx].text);
        const isStopLabel = field.stopLabels.some((sl) =>
          nextNorm.includes(normalizeForMatch(sl))
        );
        const isAnyStartLabel = FIELD_DEFS.some((fd) =>
          fd.startLabels.some((sl) => nextNorm.includes(normalizeForMatch(sl)))
        );
        if (isStopLabel || isAnyStartLabel) break;
        valueParts.push(row[nextIdx].text.trim());
      }

      if (valueParts.length > 0) {
        const value = valueParts.join(' ').trim();
        console.log(`  ✓ ${field.key}: "${value}" (next cells in same row)`);
        return value;
      }

      // Step 3: If crossRow is enabled, look at the next row
      if (field.crossRow && rowIdx + 1 < rows.length) {
        const nextRow = rows[rowIdx + 1];
        const nextRowParts: string[] = [];
        for (const nextCell of nextRow) {
          const nextNorm = normalizeForMatch(nextCell.text);
          const isStopLabel = field.stopLabels.some((sl) =>
            nextNorm.includes(normalizeForMatch(sl))
          );
          const isAnyStartLabel = FIELD_DEFS.some((fd) =>
            fd.startLabels.some((sl) => nextNorm.includes(normalizeForMatch(sl)))
          );
          if (isStopLabel || isAnyStartLabel) break;
          nextRowParts.push(nextCell.text.trim());
        }
        if (nextRowParts.length > 0) {
          const value = nextRowParts.join(' ').trim();
          // Strip colon prefix
          const cleaned = field.stripColon ? value.replace(/^[:\s]+/, '').trim() : value;
          console.log(`  ✓ ${field.key}: "${cleaned}" (next row)`);
          return cleaned;
        }
      }

      // Label found but no value
      console.log(`  ✗ ${field.key}: label found but no value`);
      return '';
    }
  }

  return '';
}

/* ── Aadhaar extraction ───────────────────────────────────────────────────── */
export function extractAadhaar(text: string): string {
  const labeled = text.match(
    /(?:Aadhaar|Aadhar|आधार)(?:\s*(?:No|Number|No\.|संख्या))?[\s:：\-–—]*([X\d]{4}[\s-]?[X\d]{4}[\s-]?[X\d]{4})/i
  );
  if (labeled) {
    const c = labeled[1].replace(/[\s-]/g, '');
    if (c.length === 12) return `${c.slice(0, 4)} ${c.slice(4, 8)} ${c.slice(8, 12)}`;
  }
  const m = text.match(/\b([X\d]{4}\s?[X\d]{4}\s?[X\d]{4})\b/i);
  if (m) {
    const c = m[1].replace(/\s/g, '');
    if (c.length === 12) return `${c.slice(0, 4)} ${c.slice(4, 8)} ${c.slice(8, 12)}`;
  }
  return '';
}

/* ── Farmer ID extraction ─────────────────────────────────────────────────── */
function extractFarmerId(lines: string[], enrollmentId: string): string {
  for (const line of lines) {
    const m = line.match(/(?:Farmer\s*ID|FID)\s*[：:=\-–—]?\s*(\d{8,})/i);
    if (m) return m[1].trim();
  }
  for (const line of lines) {
    const t = line.trim();
    if (/^\d{10,13}$/.test(t) && t !== enrollmentId.replace(/_/g, '')) return t;
  }
  return '';
}

/* ──────────────────────────────────────────────────────────────────────────────
 *  LAND TABLE PARSER
 *
 *  The table header spans multiple rows (typically 5 rows, rows 20-24 in the
 *  dump). Instead of trying to parse those fragmented header rows, we use
 *  KNOWN column X-positions from the fixed Government template.
 *
 *  Column layout (approximate X positions at scale 1.0):
 *    State/UT    ≈ 55
 *    District    ≈ 113
 *    Sub District ≈ 167
 *    Village     ≈ 220
 *    Survey No   ≈ 270
 *    Survey Sub  ≈ 306
 *    Owner Name  ≈ 343
 *    Identifier  ≈ 394
 *    Owner Type  ≈ 460
 *    Share Type  ≈ 511
 *    Total Area  ≈ 566
 *    Assigned    ≈ 656
 *
 *  Data rows start after the header (after "Acre,Hectare" row) and end
 *  before "about:blank" or page footer.
 * ────────────────────────────────────────────────────────────────────────────── */

interface ColumnDef {
  key: string;
  xMin: number;
  xMax: number;
}

// Column boundaries: each cell is assigned to the column whose X range contains it
const LAND_COLUMNS: ColumnDef[] = [
  { key: 'state',          xMin: 0,   xMax: 100 },
  { key: 'district',       xMin: 100, xMax: 155 },
  { key: 'subDistrict',    xMin: 155, xMax: 210 },
  { key: 'village',        xMin: 210, xMax: 260 },
  { key: 'surveyNumber',   xMin: 260, xMax: 300 },
  { key: 'surveySubNo',    xMin: 300, xMax: 335 },
  { key: 'ownerName',      xMin: 335, xMax: 385 },
  { key: 'identifierName', xMin: 385, xMax: 450 },
  { key: 'ownerType',      xMin: 450, xMax: 505 },
  { key: 'shareType',      xMin: 505, xMax: 555 },
  { key: 'landArea',       xMin: 555, xMax: 645 },
  { key: 'extentAssigned', xMin: 645, xMax: 800 },
];

function assignColumn(x: number): string | null {
  for (const col of LAND_COLUMNS) {
    if (x >= col.xMin && x < col.xMax) return col.key;
  }
  return null;
}

export function parseLandRecords(
  _lines: string[],
  pdfItems?: PDFTextItem[]
): LandRecord[] {
  if (!pdfItems || pdfItems.length === 0) {
    console.log('parseLandRecords: no pdfItems available, returning empty');
    return [];
  }

  const page1Items = pdfItems.filter((item) => item.pageNum === 1 && item.str.trim() !== '');

  // Find the "Land Ownership Details" header
  const landHeaderItem = page1Items.find((item) =>
    /Land\s*Ownership\s*Details/i.test(item.str)
  );
  if (!landHeaderItem) {
    console.log('parseLandRecords: "Land Ownership Details" header not found');
    return [];
  }

  // Data items are BELOW the header (lower Y values in PDF coordinates)
  // Find the last header row (contains "Acre,Hectare")
  const headerEndItem = page1Items.find((item) =>
    /Acre|Hectare/i.test(item.str)
  );
  const dataStartY = headerEndItem ? headerEndItem.y - 3 : landHeaderItem.y - 80;

  // Footer boundary
  const footerItem = page1Items.find((item) =>
    /about:blank|^\d+\/\d+$/i.test(item.str.trim())
  );
  const dataEndY = footerItem ? footerItem.y + 3 : 0;

  // Get data items between header and footer
  const dataItems = page1Items.filter(
    (item) => item.y < dataStartY && item.y > dataEndY
  );

  if (dataItems.length === 0) {
    console.log('parseLandRecords: no data items found below table header');
    return [];
  }

  // Group data items into rows by Y proximity
  const rows = groupIntoRows(dataItems);

  console.log(`parseLandRecords: Found ${rows.length} data rows`);

  // First pass: assign each cell in each row to a column
  const rawRows: Record<string, string>[] = [];
  for (const row of rows) {
    const record: Record<string, string> = {};
    for (const cell of row) {
      const colKey = assignColumn(cell.startX);
      if (colKey) {
        record[colKey] = (record[colKey] ? `${record[colKey]} ${cell.text.trim()}` : cell.text.trim());
      }
    }
    // Skip rows that have no useful data (e.g., all empty)
    if (Object.keys(record).length > 0) {
      rawRows.push(record);
    }
  }

  // Merge continuation rows: if a row has fewer columns than the first row,
  // it's likely a continuation (e.g., "DARBHANGA" split as "DARBHA" + "NGA")
  const mergedRows: Record<string, string>[] = [];
  for (const rawRow of rawRows) {
    const filledCols = Object.keys(rawRow).filter((k) => rawRow[k].trim());
    
    // A continuation row typically has fewer filled columns and no area values
    const hasArea = rawRow.landArea || rawRow.extentAssigned;
    const isNewRow = filledCols.length >= 4 || hasArea;

    if (isNewRow || mergedRows.length === 0) {
      mergedRows.push({ ...rawRow });
    } else {
      // Merge into previous row by appending text
      const prev = mergedRows[mergedRows.length - 1];
      for (const [key, value] of Object.entries(rawRow)) {
        if (value.trim()) {
          prev[key] = (prev[key] ? `${prev[key]}${key === 'surveyNumber' ? ', ' : ''}${value.trim()}` : value.trim());
        }
      }
    }
  }

  // Convert to LandRecord objects
  const records: LandRecord[] = [];
  for (const row of mergedRows) {
    const record: LandRecord = {
      state: (row.state || '').trim(),
      district: (row.district || '').trim(),
      subDistrict: (row.subDistrict || '').trim(),
      village: (row.village || '').trim(),
      surveyNumber: (row.surveyNumber || '').replace(/,\s*$/, '').trim(),
      ownerName: (row.ownerName || '').trim(),
      identifierType: (row.identifierName || '').trim(),
      ownerType: (row.ownerType || '').trim(),
      shareType: (row.shareType || '').trim(),
      landArea: (row.landArea || '').replace(/,\s*$/, '').trim(),
      extentAssigned: (row.extentAssigned || '').replace(/,\s*$/, '').trim(),
    };

    // Clean area values: "0.4454, ," → "0.4454"
    record.landArea = record.landArea.replace(/[,\s]+$/, '').trim();
    record.extentAssigned = record.extentAssigned.replace(/[,\s]+$/, '').trim();

    // Only include rows with at least a state or survey number
    if (record.state || record.surveyNumber) {
      records.push(record);
      console.log('  Land record:', JSON.stringify(record));
    }
  }

  console.log(`parseLandRecords: parsed ${records.length} records`);
  return records;
}

function calculateAge(dobStr: string): string {
  if (!dobStr) return '';
  const cleaned = dobStr.trim();
  let day = 0;
  let month = 0;
  let year = 0;

  const parts = cleaned.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
      if (parts[2].length === 2) {
        if (year > 26) {
          year += 1900;
        } else {
          year += 2000;
        }
      }
    }
  }

  if (isNaN(day) || isNaN(month) || isNaN(year) || day === 0 || year === 0) {
    return '';
  }

  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }
  return age.toString();
}

/* ──────────────────────────────────────────────────────────────────────────────
 *  MAIN PARSER ENTRY POINT
 * ────────────────────────────────────────────────────────────────────────────── */
export function parseFarmerRegistryPDF(
  fullText: string,
  lines: string[],
  pdfItems?: PDFTextItem[]
): Partial<FarmerData> {
  console.log('parseFarmerRegistryPDF: lines =', lines.length, 'chars =', fullText.length);

  // Build rows from PDF items (coordinate-aware)
  const page1Items = (pdfItems || []).filter(
    (item) => item.pageNum === 1 && item.str.trim() !== ''
  );
  const rows = groupIntoRows(page1Items);

  console.log(`parseFarmerRegistryPDF: built ${rows.length} rows from ${page1Items.length} items`);

  // Extract each field using the deterministic label→value approach
  console.log('--- Field extraction ---');
  const extracted: Record<string, string> = {};
  for (const field of FIELD_DEFS) {
    const value = extractFieldValue(rows, field);
    if (value) {
      extracted[field.key] = value;
    }
  }

  const enrollmentId = extracted.enrollmentId || '';
  const farmerName = extracted.farmerName || '';
  const hindiName = extracted.hindiName || '';
  const gender = extracted.gender || '';
  const dob = extracted.dob || '';
  const age = calculateAge(dob);
  const mobile = extracted.mobile || '';
  const address = extracted.address || '';
  const localAddress = extracted.localAddress || '';
  const category = extracted.category || 'General';

  const aadhaar = extractAadhaar(fullText);

  let farmerId = extractFarmerId(lines, enrollmentId);
  if (!farmerId) farmerId = enrollmentId;

  // Parse land records using coordinate-based column mapping
  const landRecords = parseLandRecords(lines, pdfItems);

  console.log('parseFarmerRegistryPDF RESULT:', {
    farmerName,
    hindiName,
    enrollmentId,
    farmerId,
    dob,
    gender,
    age,
    mobile,
    aadhaar,
    category,
    address: (address || localAddress).slice(0, 60),
    landRecords: landRecords.length,
  });

  return {
    farmerName,
    hindiName,
    dob,
    gender,
    age,
    category,
    mobile,
    aadhaar,
    farmerId: farmerId || enrollmentId,
    enrollmentId,
    address: address || localAddress || '',
    landRecords,
  };
}
