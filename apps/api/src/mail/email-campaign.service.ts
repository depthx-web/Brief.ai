import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';
import type { EmailCampaignKey } from '@prisma/client';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

@Injectable()
export class EmailCampaignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

  async list() {
    return this.prisma.emailCampaign.findMany({ orderBy: { key: 'asc' } });
  }

  async update(id: string, data: { enabled?: boolean; subject?: string; body?: string }) {
    return this.prisma.emailCampaign.update({ where: { id }, data });
  }

  async sendWelcome(email: string, name: string | null): Promise<void> {
    await this.sendIfEnabled('WELCOME', email, {
      NAME: name || 'there',
      DASHBOARD_URL: `${APP_URL}/dashboard`,
    });
  }

  async sendUpgradeConfirmation(email: string, name: string | null, cycle: string): Promise<void> {
    await this.sendIfEnabled('UPGRADE', email, {
      NAME: name || 'there',
      PLAN_CYCLE: cycle,
      DASHBOARD_URL: `${APP_URL}/dashboard`,
    });
  }

  async sendSecurityAlert(email: string, name: string | null, changeType: 'password' | 'email'): Promise<void> {
    await this.sendIfEnabled('SECURITY', email, {
      NAME: name || 'there',
      CHANGE_TYPE: changeType,
    });
  }

  async sendWinBack(email: string, name: string | null, discountCode: string): Promise<void> {
    await this.sendIfEnabled('WINBACK', email, {
      NAME: name || 'there',
      DISCOUNT_CODE: discountCode,
      PRICING_URL: `${APP_URL}/pricing`,
    });
  }

  async sendRetentionWarning(email: string, name: string | null, filename: string): Promise<void> {
    await this.sendIfEnabled('RETENTION_WARNING', email, {
      NAME: name || 'there',
      FILENAME: filename,
      LIBRARY_URL: `${APP_URL}/library`,
    });
  }

  async sendSignupConfirmation(email: string, name: string | null, confirmUrl: string): Promise<void> {
    await this.sendIfEnabled('SIGNUP_CONFIRMATION', email, {
      NAME: name || 'there',
      CONFIRM_URL: confirmUrl,
    });
  }

  async sendPaymentReceipt(email: string, name: string | null, amount: string): Promise<void> {
    await this.sendIfEnabled('PAYMENT_RECEIPT', email, {
      NAME: name || 'there',
      AMOUNT: amount,
      DASHBOARD_URL: `${APP_URL}/dashboard`,
    });
  }

  async sendPlanChanged(email: string, name: string | null, cycle: string): Promise<void> {
    await this.sendIfEnabled('PLAN_CHANGED', email, {
      NAME: name || 'there',
      PLAN_CYCLE: cycle,
      DASHBOARD_URL: `${APP_URL}/dashboard`,
    });
  }

  async sendCancellationConfirmation(email: string, name: string | null): Promise<void> {
    await this.sendIfEnabled('CANCELLATION_CONFIRMATION', email, {
      NAME: name || 'there',
      PRICING_URL: `${APP_URL}/pricing`,
    });
  }

  async sendReferralSuccess(email: string, name: string | null, amount: string): Promise<void> {
    await this.sendIfEnabled('REFERRAL_SUCCESS', email, {
      NAME: name || 'there',
      AMOUNT: amount,
      REFERRALS_URL: `${APP_URL}/referrals`,
    });
  }

  async sendTeamInvitation(email: string, teamName: string, inviterName: string | null, inviteUrl: string): Promise<void> {
    await this.sendIfEnabled('TEAM_INVITATION', email, {
      TEAM_NAME: teamName,
      INVITER_NAME: inviterName || 'A teammate',
      INVITE_URL: inviteUrl,
    });
  }

  private async sendIfEnabled(key: EmailCampaignKey, to: string, vars: Record<string, string>): Promise<void> {
    const campaign = await this.prisma.emailCampaign.findUnique({ where: { key } });
    if (!campaign?.enabled) return;
    await this.mail.send({
      to,
      subject: substitute(campaign.subject, vars),
      html: substitute(campaign.body, vars),
    });
  }
}

// Every current call site only ever substitutes a recipient's own data back
// to themselves, so this isn't exploitable against a third party today —
// but escaping here is what keeps it that way if a future template ever
// substitutes one user's data into an email sent to someone else.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function substitute(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => escapeHtml(vars[key] ?? ''));
}
