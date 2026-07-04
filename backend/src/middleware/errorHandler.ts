import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
const { JsonWebTokenError, TokenExpiredError } = jwt;
import { MulterError } from 'multer';
import { ApiError } from '../utils/ApiError.js';
import env from '../config/env.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: string[] = [];

  // ApiError — our custom operational errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // Prisma known request errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        const target = (err.meta?.target as string[]) || [];
        message = `Duplicate value for field: ${target.join(', ')}`;
        break;
      }
      case 'P2025': {
        statusCode = 404;
        message = 'Record not found';
        break;
      }
      case 'P2003': {
        statusCode = 400;
        message = 'Foreign key constraint failed';
        break;
      }
      default: {
        statusCode = 400;
        message = `Database error: ${err.code}`;
        break;
      }
    }
  }

  // Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  // JWT errors
  else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Token has expired';
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Multer errors
  else if (err instanceof MulterError) {
    statusCode = 400;
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size exceeds the allowed limit';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected file field: ${err.field}`;
        break;
      default:
        message = `File upload error: ${err.message}`;
        break;
    }
  }

  // SyntaxError (malformed JSON)
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      statusCode,
      message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
