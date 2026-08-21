import { Injectable, Logger } from '@nestjs/common';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM ?? 'Dossiera <noreply@brief.ai>';

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

// Thin wrapper over Resend's HTTP API (no SDK dependency needed — it's a
// single POST). Falls back to logging the message when RESEND_API_KEY isn't
// set, so password resets and campaign emails don't crash in dev/before the
// provider is configured — they just don't actually send.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  isConfigured(): boolean {
    return Boolean(RESEND_API_KEY);
  }

  async send(message: MailMessage): Promise<void> {
    if (!RESEND_API_KEY) {
      this.logger.warn(
        `RESEND_API_KEY not set — email not sent. Would have sent "${message.subject}" to ${message.to}.`
      );
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: MAIL_FROM,
          to: message.to,
          subject: message.subject,
          html: message.html,
        }),
      });
      if (!response.ok) {
        this.logger.error(`Resend send failed: ${response.status} ${await response.text()}`);
      }
    } catch (err) {
      this.logger.error(`Resend send request failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
