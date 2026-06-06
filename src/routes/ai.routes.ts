import { Router } from 'express';
import { generateDescription } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateDescriptionSchema } from '../validators/ai.validator';

const router = Router();

router.post('/generate-description', authenticate, validate(generateDescriptionSchema), generateDescription);

export default router;
