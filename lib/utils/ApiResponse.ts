import { NextResponse } from 'next/server';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export class ApiResponse {
  static success<T>(data: T, message: string = 'Success', statusCode: number = 200) {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
    };
    return NextResponse.json(payload, { status: statusCode });
  }

  static created<T>(data: T, message: string = 'Created successfully') {
    return ApiResponse.success(data, message, 201);
  }

  static noContent(message: string = 'Deleted successfully') {
    const payload: ApiResponsePayload = {
      success: true,
      message,
    };
    return NextResponse.json(payload, { status: 200 });
  }

  static error(message: string, statusCode: number = 500, errors: string[] = []) {
    const payload = {
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined,
    };
    return NextResponse.json(payload, { status: statusCode });
  }
}
