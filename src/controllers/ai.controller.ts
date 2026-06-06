import { Request, Response, NextFunction } from 'express';
import { generateTaskDescription } from '../services/ai.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/errors';

export async function generateDescription(req: Request, res: Response, next: NextFunction) {
  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      throw new AppError('Task title is required', 400);
    }

    const description = await generateTaskDescription(title);
    sendSuccess(res, { description });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Cerebras API key not configured') {
      return res.status(503).json({
        success: false,
        message: 'AI service not configured. Set CEREBRAS_API_KEY in .env',
      });
    }
    next(err);
  }
}
