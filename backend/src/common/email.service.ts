import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? '587');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass } : undefined,
      });
      this.transporter.verify()
        .then(() => this.logger.log('SMTP transport prêt'))
        .catch((err) => this.logger.error(`SMTP verify échoué: ${err?.message || err}`));
    } else {
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      this.logger.warn('SMTP non configuré, mode jsonTransport activé');
    }
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    const from = this.config.get<string>('EMAIL_FROM') || 'no-reply@localhost';
    try {
      const info = await this.transporter.sendMail({ from, to, subject, text, html });
      this.logger.log(`Email envoyé à ${to}: ${subject}`);
      if ((info as any)?.messageId) this.logger.log(`MessageID: ${(info as any).messageId}`);
    } catch (e) {
      this.logger.error(`Échec envoi email à ${to}: ${e?.message || e}`);
    }
  }
}
