import { Router } from 'express';
import {
  addComment,
  getComments,
  deleteComment,
  addAttachment,
  getAttachments,
  deleteAttachment,
} from '../controllers/comments.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema } from '../validators/comments.validator';
import { upload } from '../middleware/upload';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Comments
router.post('/', validate(createCommentSchema), addComment);
router.get('/', getComments);
router.delete('/:commentId', deleteComment);

// Attachments
router.post('/attachments', upload.single('file'), addAttachment);
router.get('/attachments', getAttachments);
router.delete('/attachments/:attachmentId', deleteAttachment);

export default router;
