import { Router } from 'express';
import { getUser, updateUser } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../validators/users.validator';

const router = Router();

router.get('/:id', authenticate, getUser);
router.put('/:id', authenticate, validate(updateUserSchema), updateUser);

export default router;
