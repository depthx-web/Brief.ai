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

  async sendWinBack(email: string, name: string | null, discountCode: string): Promise<void> {
    await this.sendIfEnabled('WINBACK', email, {
      NAME: name || 'there',
      DISCOUNT_CODE: discountCode,
      PRICING_URL: `${APP_URL}/pricing`,
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

function substitute(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => vars[key] ?? '');
}
