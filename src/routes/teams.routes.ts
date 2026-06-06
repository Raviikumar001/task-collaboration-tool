import { Router } from 'express';
import {
  createTeam,
  getTeams,
  getTeam,
  addMember,
  removeMember,
  updateMemberRole,
} from '../controllers/teams.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTeamSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from '../validators/teams.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTeamSchema), createTeam);
router.get('/', getTeams);
router.get('/:id', getTeam);
router.post('/:id/members', validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', removeMember);
router.patch('/:id/members/:userId', validate(updateMemberRoleSchema), updateMemberRole);

export default router;
