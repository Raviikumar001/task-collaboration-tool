import { Request, Response, NextFunction } from 'express';
import * as teamsService from '../services/teams.service';
import { sendSuccess } from '../utils/response';

export async function createTeam(req: Request, res: Response, next: NextFunction) {
  try {
    const team = await teamsService.createTeam(
      req.body.name,
      req.body.description,
      req.user!.id,
    );
    sendSuccess(res, team, 201);
  } catch (err) {
    next(err);
  }
}

export async function getTeams(req: Request, res: Response, next: NextFunction) {
  try {
    const teams = await teamsService.getUserTeams(req.user!.id);
    sendSuccess(res, teams);
  } catch (err) {
    next(err);
  }
}

export async function getTeam(req: Request, res: Response, next: NextFunction) {
  try {
    const team = await teamsService.getTeamById(req.params.id, req.user!.id);
    sendSuccess(res, team);
  } catch (err) {
    next(err);
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await teamsService.addMember(
      req.params.id,
      req.body.email,
      req.body.role,
      req.user!.id,
    );
    sendSuccess(res, member, 201);
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    await teamsService.removeMember(
      req.params.id,
      req.params.userId,
      req.user!.id,
    );
    sendSuccess(res, { message: 'Member removed successfully' });
  } catch (err) {
    next(err);
  }
}

export async function updateMemberRole(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await teamsService.updateMemberRole(
      req.params.id,
      req.params.userId,
      req.body.role,
      req.user!.id,
    );
    sendSuccess(res, member);
  } catch (err) {
    next(err);
  }
}
