import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
  }

  async sendEmailVerification(to: string, verifyUrl: string) {
    const mailFrom = this.config.get<string>('MAIL_FROM') || 'Devnex <noreply@mail.arvidn.dev>';
    const mailApiUrl = this.config.get<string>('MAIL_API_URL');
    const mailApiKey = this.config.get<string>('MAIL_API_KEY');
    if (!mailApiUrl || !mailApiKey) {
      throw new Error('MAIL_API_URL and MAIL_API_KEY must be configured');
    }

    const response = await fetch(`${mailApiUrl}/send`, {
      method: 'POST',
      headers: { 'x-api-key': mailApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: mailFrom,
        to,
        subject: 'Verify your email address',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#18181b;">
            <h2 style="margin:0 0 16px;">Verify your email</h2>
            <p style="margin:0 0 20px;">Click the button below to verify your email address. The link expires in 24 hours.</p>
            <a href="${verifyUrl}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Verify Email</a>
            <p style="margin:20px 0 0;color:#71717a;font-size:13px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `,
        idempotencyKey: `email-verify:${to}-${new Date().toISOString()}`,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error
        ? `${data.error}${data.details ? `: ${JSON.stringify(data.details)}` : ''}`
        : `Mail service error (${response.status})`;
      throw new Error(msg);
    }
    this.logger.log(`Verification mail sent to ${to} (logId=${data.logId})`);
  }

  async sendPasswordResetEmail(to: string, resetUrl: string, ttlMs: number) {
    const mailFrom = this.config.get<string>('MAIL_FROM') || 'Devnex <noreply@mail.arvidn.dev>';
    const mailApiUrl = this.config.get<string>('MAIL_API_URL');
    const mailApiKey = this.config.get<string>('MAIL_API_KEY');
    if (!mailApiUrl || !mailApiKey) {
      throw new Error('MAIL_API_URL and MAIL_API_KEY must be configured');
    }

    const expiresMinutes = Math.round(ttlMs / 60_000);

    const response = await fetch(`${mailApiUrl}/send`, {
      method: 'POST',
      headers: { 'x-api-key': mailApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: mailFrom,
        to,
        subject: 'Reset your password',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#18181b;">
            <h2 style="margin:0 0 16px;">Reset your password</h2>
            <p style="margin:0 0 20px;">Click the button below to choose a new password. This link expires in ${expiresMinutes} minutes.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Reset Password</a>
            <p style="margin:20px 0 0;color:#71717a;font-size:13px;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `,
        idempotencyKey: `password-reset:${to}:${Date.now()}`,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error
        ? `${data.error}${data.details ? `: ${JSON.stringify(data.details)}` : ''}`
        : `Mail service error (${response.status})`;
      throw new Error(msg);
    }
    this.logger.log(`Password reset mail sent to ${to} (logId=${data.logId})`);
  }

  async sendVerificationCode(to: string, code: string, expiresIn: number) {
    const mailFrom = this.config.get<string>('MAIL_FROM') || 'Devnex <no-reply@mail.arvid.dev>';
    const mailApiUrl = this.config.get<string>('MAIL_API_URL');
    const mailApiKey = this.config.get<string>('MAIL_API_KEY');
    if (!mailApiUrl || !mailApiKey) {
      throw new Error('MAIL_API_URL and MAIL_API_KEY must be configured');
    }

    const response = await fetch(`${mailApiUrl}/send`, {
      method: 'POST',
      headers: {
        'x-api-key': mailApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: mailFrom,
        to: to,
        template: 'otp',
        data: {
          otp: code,
          expiresIn: `${expiresIn / 60000} min`,
        },
        idempotencyKey: `otp:${to}:${code}`,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg =
        data?.error
          ? `${data.error}${data.details ? `: ${JSON.stringify(data.details)}` : ''}`
          : `Mail service error (${response.status})`;
      throw new Error(msg);
    }

    // success path
    this.logger.log(`Mail ${data.status} for ${to} (logId=${data.logId})`);
  }

  async sendSubscriptionConfirmation(
    to: string,
    params: {
      name?: string | null;
      plan: string;
      amount: number; // in cents
      currency: string;
      paymentId: string;
      periodStart: Date;
      periodEnd: Date;
      /** When set and still in the future, email highlights trial length and end date */
      trialEndsAt?: Date;
    },
  ) {
    const { name, plan, amount, currency, paymentId, periodStart, periodEnd, trialEndsAt } =
      params;
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

    const now = new Date();
    const trialActive =
      trialEndsAt != null && trialEndsAt.getTime() > now.getTime();

    let trialDaysApprox = 0;
    let trialEndsFormatted = '';
    if (trialActive && trialEndsAt) {
      trialDaysApprox = Math.max(
        1,
        Math.ceil((trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
      );
      trialEndsFormatted = trialEndsAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    const mailFrom = this.config.get<string>('MAIL_FROM') || 'Storage <no-reply@mail.arvid.dev>';
    const mailApiUrl = this.config.get<string>('MAIL_API_URL');
    const mailApiKey = this.config.get<string>('MAIL_API_KEY');
    if (!mailApiUrl || !mailApiKey) {
      throw new Error('MAIL_API_URL and MAIL_API_KEY must be configured');
    }

    const subject = trialActive
      ? `Trial activated — ${plan} plan`
      : `Subscription activated — ${plan}`;

    const introHtml = trialActive
      ? `
          <p style="margin: 0 0 12px;">Thank you${name ? `, ${name}` : ''}!</p>
          <p style="margin: 0 0 16px;">
            Your <strong>free trial</strong> for the <strong>${plan}</strong> plan is now active.
          </p>
          <p style="margin: 0 0 16px;">
            Your trial runs for approximately <strong>${trialDaysApprox}</strong> day${trialDaysApprox === 1 ? '' : 's'},
            until <strong>${trialEndsFormatted}</strong>.
            After that, your paid subscription continues at the rate shown below unless you cancel before the trial ends.
          </p>`
      : `
          <p style="margin: 0 0 16px;">Your <strong>${plan}</strong> subscription is now active${name ? `, ${name}` : ''}. Thank you!</p>`;

    const response = await fetch(`${mailApiUrl}/send`, {
      method: 'POST',
      headers: {
        'x-api-key': mailApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: mailFrom,
        to: to,
        subject,
        html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #18181b;">
          <h2 style="margin: 0 0 16px;">${trialActive ? 'Your trial has started' : 'Payment received — thank you!'}</h2>
          ${introHtml}
          <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #71717a;">Plan</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">${plan}</td></tr>
              <tr><td style="padding: 4px 0; color: #71717a;">Amount</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">${formatted}</td></tr>
              <tr><td style="padding: 4px 0; color: #71717a;">Payment ID</td><td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 12px;">${paymentId}</td></tr>
              <tr><td style="padding: 4px 0; color: #71717a;">Billing period</td><td style="padding: 4px 0; text-align: right;">${periodStart.toLocaleDateString()} — ${periodEnd.toLocaleDateString()}</td></tr>
              ${trialActive
            ? `<tr><td style="padding: 4px 0; color: #71717a;">Trial ends</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">${trialEndsFormatted}</td></tr>`
            : ''
          }
            </table>
          </div>
          <p style="color: #71717a; font-size: 14px; margin: 0;">Keep this email as your receipt. If you have any questions, just reply to this message.</p>
        </div>
      `,
        idempotencyKey: `subscription-confirmation:${to}:${paymentId}`,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg =
        data?.error
          ? `${data.error}${data.details ? `: ${JSON.stringify(data.details)}` : ''}`
          : `Mail service error (${response.status})`;
      throw new Error(msg);
    }

    this.logger.log(`Mail ${data.status} for ${to} (logId=${data.logId})`);
  }

  async sendSubscriptionCancellation(
    to: string,
    params: { name?: string | null; plan: string; cancelAt: Date },
  ) {
    const { name, plan, cancelAt } = params;
    const mailFrom = this.config.get<string>('MAIL_FROM') || 'Storage <no-reply@mail.arvid.dev>';
    const mailApiUrl = this.config.get<string>('MAIL_API_URL');
    const mailApiKey = this.config.get<string>('MAIL_API_KEY');
    if (!mailApiUrl || !mailApiKey) {
      throw new Error('MAIL_API_URL and MAIL_API_KEY must be configured');
    }

    const dateStr = cancelAt.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const response = await fetch(`${mailApiUrl}/send`, {
      method: 'POST',
      headers: { 'x-api-key': mailApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: mailFrom,
        to,
        subject: `Your ${plan} subscription has been cancelled`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #18181b;">
            <h2 style="margin: 0 0 16px;">Subscription cancelled${name ? `, ${name}` : ''}</h2>
            <p style="margin: 0 0 16px;">
              Your <strong>${plan}</strong> subscription has been set to cancel.
              You will retain full access to all features until <strong>${dateStr}</strong>.
            </p>
            <p style="color: #71717a; font-size: 14px; margin: 0;">
              After that date your account will revert to the free tier.
              If you change your mind, you can resubscribe at any time before then.
            </p>
          </div>
        `,
        idempotencyKey: `subscription-cancellation:${Date.now()}`,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error
        ? `${data.error}${data.details ? `: ${JSON.stringify(data.details)}` : ''}`
        : `Mail service error (${response.status})`;
      throw new Error(msg);
    }
    this.logger.log(`Cancellation mail sent to ${to} (logId=${data.logId})`);
  }

  async sendSubscriptionReactivated(
    to: string,
    params: { name?: string | null; plan: string; renewsOn: Date },
  ) {
    const { name, plan, renewsOn } = params;
    const mailFrom = this.config.get<string>('MAIL_FROM') || 'Storage <no-reply@mail.arvid.dev>';
    const mailApiUrl = this.config.get<string>('MAIL_API_URL');
    const mailApiKey = this.config.get<string>('MAIL_API_KEY');
    if (!mailApiUrl || !mailApiKey) {
      throw new Error('MAIL_API_URL and MAIL_API_KEY must be configured');
    }

    const dateStr = renewsOn.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const response = await fetch(`${mailApiUrl}/send`, {
      method: 'POST',
      headers: { 'x-api-key': mailApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: mailFrom,
        to,
        subject: `Your ${plan} subscription is active again`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #18181b;">
            <h2 style="margin: 0 0 16px;">Subscription reactivated${name ? `, ${name}` : ''}</h2>
            <p style="margin: 0 0 16px;">
              You removed the scheduled cancellation for your <strong>${plan}</strong> plan.
              Your subscription will renew automatically on <strong>${dateStr}</strong>.
            </p>
            <p style="color: #71717a; font-size: 14px; margin: 0;">
              Thank you for staying with us. If you did not request this change, please contact support.
            </p>
          </div>
        `,
        idempotencyKey: `subscription-reactivated:${Date.now()}`,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error
        ? `${data.error}${data.details ? `: ${JSON.stringify(data.details)}` : ''}`
        : `Mail service error (${response.status})`;
      throw new Error(msg);
    }
    this.logger.log(`Reactivation mail sent to ${to} (logId=${data.logId})`);
  }

  async sendPasswordResetCode(to: string, code: string, expiresIn: number) {
    const mailFrom = this.config.get<string>('MAIL_FROM') || 'Storage <no-reply@mail.arvid.dev>';
    const mailApiUrl = this.config.get<string>('MAIL_API_URL');
    const mailApiKey = this.config.get<string>('MAIL_API_KEY');
    if (!mailApiUrl || !mailApiKey) {
      throw new Error('MAIL_API_URL and MAIL_API_KEY must be configured');
    }

    const response = await fetch(`${mailApiUrl}/send`, {
      method: 'POST',
      headers: {
        'x-api-key': mailApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: mailFrom,
        to: to,
        subject: 'Password Reset',
        template: 'otp',
        data: {
          otp: code,
          expiresIn: `${expiresIn / 60000} min`,
        },
        idempotencyKey: `otp:${to}:${code}`,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg =
        data?.error
          ? `${data.error}${data.details ? `: ${JSON.stringify(data.details)}` : ''}`
          : `Mail service error (${response.status})`;
      throw new Error(msg);
    }

    this.logger.log(`Mail ${data.status} for ${to} (logId=${data.logId})`);
  }

  async sendPasswordResetSuccess(to: string) {
    const mailFrom = this.config.get<string>('MAIL_FROM') || 'Storage <no-reply@mail.arvid.dev>';
    const mailApiUrl = this.config.get<string>('MAIL_API_URL');
    const mailApiKey = this.config.get<string>('MAIL_API_KEY');
    if (!mailApiUrl || !mailApiKey) {
      throw new Error('MAIL_API_URL and MAIL_API_KEY must be configured');
    }
    const response = await fetch(`${mailApiUrl}/send`, {
      method: 'POST',
      headers: {
        'x-api-key': mailApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: mailFrom,
        to: to,
        subject: 'Password Reset Success',
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #18181b;">
            <h2 style="margin: 0 0 16px;">Password Reset Success</h2>
            <p style="margin: 0 0 16px;">Your password has been reset successfully.</p>
            <p style="margin: 0 0 16px;">If you did not request this, please contact support.</p>
          </div>
        `,
        idempotencyKey: `password-reset-success:${to}`,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg =
        data?.error
          ? `${data.error}${data.details ? `: ${JSON.stringify(data.details)}` : ''}`
          : `Mail service error (${response.status})`;
      throw new Error(msg);
    }

    this.logger.log(`Mail ${data.status} for ${to} (logId=${data.logId})`);
  }
}