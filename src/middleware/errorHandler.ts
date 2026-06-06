import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';
import { JsonWebTokenError } from 'jsonwebtoken';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Maximum size is 10MB'
        : `Upload error: ${err.message}`,
    });
  }

  if (err.message === 'File type not allowed') {
    return res.status(400).json({
      success: false,
      message: 'File type not allowed. Allowed: JPEG, PNG, GIF, PDF, TXT, DOC, DOCX',
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
