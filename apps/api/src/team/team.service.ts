import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailCampaignService } from '../mail/email-campaign.service';
import { CreditsService } from '../credits/credits.service';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';
const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailCampaigns: EmailCampaignService,
    private readonly credits: CreditsService
  ) {}

  // Included with an existing paid plan, not a separately purchased add-on
  // — the only gate is plan === 'PAID'. One team per user (as owner or
  // member) for now, matching the single "Team Settings" section the UI
  // exposes rather than a team-switcher.
  async createTeam(ownerUserId: string, name: string) {
    if (!name.trim()) throw new BadRequestException('A team name is required.');
    const user = await this.prisma.user.findUnique({ where: { id: ownerUserId } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.plan !== 'PAID') {
      throw new ForbiddenException('Team accounts are included with a paid plan — upgrade first.');
    }
    const existing = await this.findMyMembership(ownerUserId);
    if (existing) throw new BadRequestException('You already belong to a team.');

    const team = await this.prisma.team.create({ data: { name: name.trim(), ownerUserId } });
    await this.prisma.teamMember.create({
      data: { teamId: team.id, userId: ownerUserId, role: 'OWNER', status: 'ACTIVE' },
    });
    return team;
  }

  private async findMyMembership(userId: string) {
    return this.prisma.teamMember.findFirst({ where: { userId, status: 'ACTIVE' }, include: { team: true } });
  }

  private async requireOwner(userId: string, teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found.');
    if (team.ownerUserId !== userId) throw new ForbiddenException('Only the team owner can do this.');
    return team;
  }

  // Team Settings' main view — everything the current user is allowed to
  // see about their own team. Owner-only fields (pending invitations,
  // other members' usage/budget) are simply omitted for a regular member,
  // not gated behind a separate endpoint.
  async getMyTeam(userId: string) {
    const membership = await this.findMyMembership(userId);
    if (!membership) return null;
    const { team } = membership;
    const isOwner = team.ownerUserId === userId;

    const members = await this.prisma.teamMember.findMany({
      where: { teamId: team.id, status: 'ACTIVE' },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { joinedAt: 'asc' },
    });
    const membersWithUsage = await Promise.all(
      members.map(async (m) => {
        const settings = isOwner
          ? await this.prisma.teamMemberSettings.findUnique({ where: { teamId_userId: { teamId: team.id, userId: m.userId } } })
          : null;
        return {
          userId: m.userId,
          email: m.user.email,
          name: m.user.name,
          role: m.role,
          joinedAt: m.joinedAt,
          monthlyUsage: isOwner ? await this.credits.getMonthlyUsage(m.userId) : null,
          tokenBudgetOverride: settings?.tokenBudgetOverride ?? null,
          canShareProjects: settings?.canShareProjects ?? true,
        };
      })
    );

    const invitations = isOwner
      ? await this.prisma.teamInvitation.findMany({ where: { teamId: team.id, status: 'PENDING' }, orderBy: { createdAt: 'desc' } })
      : [];

    return {
      id: team.id,
      name: team.name,
      isOwner,
      members: membersWithUsage,
      invitations: invitations.map((i) => ({ id: i.id, email: i.email, createdAt: i.createdAt, expiresAt: i.expiresAt })),
    };
  }

  async inviteMember(ownerUserId: string, teamId: string, email: string) {
    const team = await this.requireOwner(ownerUserId, teamId);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) throw new BadRequestException('An email address is required.');

    const existingUser = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      const alreadyMember = await this.prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: existingUser.id } },
      });
      if (alreadyMember?.status === 'ACTIVE') throw new BadRequestException('This person is already a team member.');
    }
    const pending = await this.prisma.teamInvitation.findFirst({ where: { teamId, email: normalizedEmail, status: 'PENDING' } });
    if (pending) throw new BadRequestException('An invitation is already pending for this email.');

    const token = randomBytes(24).toString('base64url');
    const invitation = await this.prisma.teamInvitation.create({
      data: { teamId, email: normalizedEmail, invitedByUserId: ownerUserId, token, expiresAt: new Date(Date.now() + INVITATION_TTL_MS) },
    });

    const owner = await this.prisma.user.findUnique({ where: { id: ownerUserId } });
    await this.emailCampaigns.sendTeamInvitation(
      normalizedEmail,
      team.name,
      owner?.name ?? null,
      `${APP_URL}/team/invite?token=${token}`
    );
    return invitation;
  }

  async revokeInvitation(ownerUserId: string, invitationId: string) {
    const invitation = await this.prisma.teamInvitation.findUnique({ where: { id: invitationId } });
    if (!invitation) throw new NotFoundException('Invitation not found.');
    await this.requireOwner(ownerUserId, invitation.teamId);
    await this.prisma.teamInvitation.delete({ where: { id: invitationId } });
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.teamInvitation.findUnique({ where: { token }, include: { team: true } });
    if (!invitation) throw new NotFoundException('Invitation not found.');
    if (invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
      throw new BadRequestException('This invitation is no longer valid.');
    }
    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.getInvitationByToken(token);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.email !== invitation.email) {
      throw new ForbiddenException('This invitation was sent to a different email address.');
    }
    const existingMembership = await this.findMyMembership(userId);
    if (existingMembership && existingMembership.teamId !== invitation.teamId) {
      throw new BadRequestException('You already belong to a different team.');
    }

    await this.prisma.$transaction([
      this.prisma.teamMember.upsert({
        where: { teamId_userId: { teamId: invitation.teamId, userId } },
        create: { teamId: invitation.teamId, userId, role: 'MEMBER', status: 'ACTIVE' },
        update: { status: 'ACTIVE' },
      }),
      this.prisma.teamInvitation.update({ where: { id: invitation.id }, data: { status: 'ACCEPTED' } }),
    ]);
  }

  async declineInvitation(token: string) {
    const invitation = await this.getInvitationByToken(token);
    await this.prisma.teamInvitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
  }

  // --- Owner drawer actions (Team Settings, owner-only view) --------------

  async setMemberBudget(ownerUserId: string, teamId: string, memberUserId: string, tokenBudgetOverride: number | null) {
    await this.requireOwner(ownerUserId, teamId);
    await this.prisma.teamMemberSettings.upsert({
      where: { teamId_userId: { teamId, userId: memberUserId } },
      create: { teamId, userId: memberUserId, tokenBudgetOverride },
      update: { tokenBudgetOverride },
    });
  }

  async setCanShareProjects(ownerUserId: string, teamId: string, memberUserId: string, canShareProjects: boolean) {
    await this.requireOwner(ownerUserId, teamId);
    await this.prisma.teamMemberSettings.upsert({
      where: { teamId_userId: { teamId, userId: memberUserId } },
      create: { teamId, userId: memberUserId, canShareProjects },
      update: { canShareProjects },
    });
  }

  async listMemberProjects(ownerUserId: string, teamId: string, memberUserId: string) {
    await this.requireOwner(ownerUserId, teamId);
    return this.prisma.project.findMany({
      where: { teamId, userId: memberUserId },
      select: { id: true, name: true, visibility: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
