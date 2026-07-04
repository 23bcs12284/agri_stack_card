import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => {
      if (err.type === 'field') {
        return `${err.path}: ${err.msg}`;
      }
      return err.msg as string;
    });

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
    return;
  }

  next();
}
