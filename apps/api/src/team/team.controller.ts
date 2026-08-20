import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SafeUser } from '../auth/auth.service';
import { TeamService } from './team.service';

interface CreateTeamBody {
  name?: string;
}

interface InviteBody {
  email?: string;
}

interface BudgetBody {
  tokenBudgetOverride?: number | null;
}

interface SharingBody {
  canShareProjects?: boolean;
}

@ApiTags('team')
@ApiBearerAuth()
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTeam(@Body() body: CreateTeamBody, @CurrentUser() user: SafeUser) {
    if (!body.name?.trim()) throw new BadRequestException('A team name is required.');
    return this.teamService.createTeam(user.id, body.name.trim());
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyTeam(@CurrentUser() user: SafeUser) {
    return this.teamService.getMyTeam(user.id);
  }

  @Post(':teamId/invitations')
  @UseGuards(JwtAuthGuard)
  async invite(@Param('teamId') teamId: string, @Body() body: InviteBody, @CurrentUser() user: SafeUser) {
    if (!body.email?.trim()) throw new BadRequestException('An email address is required.');
    return this.teamService.inviteMember(user.id, teamId, body.email.trim());
  }

  @Delete('invitations/:id')
  @UseGuards(JwtAuthGuard)
  async revokeInvitation(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    await this.teamService.revokeInvitation(user.id, id);
    return { success: true };
  }

  // No auth guard — a guest without an account yet must be able to see
  // what team/who invited them before signing up (SignupForm's flow then
  // redirects back to accept once they have an account).
  @Get('invitations/:token')
  async getInvitation(@Param('token') token: string) {
    const invitation = await this.teamService.getInvitationByToken(token);
    return { teamName: invitation.team.name, email: invitation.email };
  }

  @Post('invitations/:token/accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(@Param('token') token: string, @CurrentUser() user: SafeUser) {
    await this.teamService.acceptInvitation(token, user.id);
    return { success: true };
  }

  @Post('invitations/:token/decline')
  async declineInvitation(@Param('token') token: string) {
    await this.teamService.declineInvitation(token);
    return { success: true };
  }

  @Patch(':teamId/members/:memberUserId/budget')
  @UseGuards(JwtAuthGuard)
  async setMemberBudget(
    @Param('teamId') teamId: string,
    @Param('memberUserId') memberUserId: string,
    @Body() body: BudgetBody,
    @CurrentUser() user: SafeUser
  ) {
    await this.teamService.setMemberBudget(user.id, teamId, memberUserId, body.tokenBudgetOverride ?? null);
    return { success: true };
  }

  @Patch(':teamId/members/:memberUserId/sharing')
  @UseGuards(JwtAuthGuard)
  async setCanShareProjects(
    @Param('teamId') teamId: string,
    @Param('memberUserId') memberUserId: string,
    @Body() body: SharingBody,
    @CurrentUser() user: SafeUser
  ) {
    await this.teamService.setCanShareProjects(user.id, teamId, memberUserId, Boolean(body.canShareProjects));
    return { success: true };
  }

  @Get(':teamId/members/:memberUserId/projects')
  @UseGuards(JwtAuthGuard)
  async listMemberProjects(
    @Param('teamId') teamId: string,
    @Param('memberUserId') memberUserId: string,
    @CurrentUser() user: SafeUser
  ) {
    return this.teamService.listMemberProjects(user.id, teamId, memberUserId);
  }
}
