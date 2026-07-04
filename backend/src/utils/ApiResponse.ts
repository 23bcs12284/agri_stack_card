import { Response } from 'express';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message: string = 'Created successfully'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response, message: string = 'Deleted successfully'): Response {
    const payload: ApiResponsePayload = {
      success: true,
      message,
    };
    return res.status(200).json(payload);
  }

  static error(res: Response, message: string, statusCode: number = 500, errors: string[] = []): Response {
    const payload = {
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined,
    };
    return res.status(statusCode).json(payload);
  }
}
