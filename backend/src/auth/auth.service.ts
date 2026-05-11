import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { Request } from 'express';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GoogleProfile } from './strategies/google.strategy';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

type SafeUser = {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  roles: Array<{ role: { name: string } }>;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) { }

  // ─── Register ───────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { email: dto.email, passwordHash },
      });
      await tx.profile.create({ data: { userId: u.id } });
      return u;
    });

    const verifyToken = this.jwtService.sign(
      { sub: user.id, type: 'email-verify' },
      { expiresIn: '24h' },
    );

    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    await this.mail.sendEmailVerification(
      user.email,
      `${frontendUrl}/${dto.locale}/auth/verify-email?token=${verifyToken}`,
    );

    return { message: 'Registration successful. Check your email to verify your account.' };
  }

  // ─── Verify Email ────────────────────────────────────────────────────────────

  async verifyEmail(dto: VerifyEmailDto) {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify<{ sub: string; type: string }>(
        dto.token,
      );
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (payload.type !== 'email-verify') {
      throw new BadRequestException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.emailVerifiedAt) {
      return { message: 'Email already verified' };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });

    return { message: 'Email verified successfully' };
  }

  // ─── Login ───────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, req: Request) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: { include: { role: true } } },
    });

    if (!user || user.deletedAt) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = user.passwordHash
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException('Please verify your email before logging in');
    }

    const accessToken = await this.createSession(user.id, req);

    return {
      access_token: accessToken,
      user: this.toSafeUser(user),
    };
  }

  // ─── Logout (current session) ─────────────────────────────────────────────

  async logout(sessionId: string) {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  // ─── Logout all sessions ──────────────────────────────────────────────────

  async logoutAll(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'All sessions revoked' };
  }

  // ─── Get current user ─────────────────────────────────────────────────────

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new UnauthorizedException();
    return this.toSafeUser(user);
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return the same response to prevent email enumeration
    if (!user || user.deletedAt) {
      return { message: 'If that email is registered, a reset link has been sent.' };
    }

    // Upsert: remove any existing token first (one-per-user constraint)
    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    await this.mail.sendPasswordResetEmail(
      user.email,
      `${frontendUrl}/${dto.locale}/auth/reset-password?token=${rawToken}`,
      RESET_TOKEN_TTL_MS,
    );

    return { message: 'If that email is registered, a reset link has been sent.' };
  }

  // ─── Reset Password ───────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');

    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.session.updateMany({
        where: { userId: resetRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.mail.sendPasswordResetSuccess(resetRecord.user.email);

    return { message: 'Password reset successfully. Please log in with your new password.' };
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  async handleGoogleOAuth(profile: GoogleProfile, req: Request): Promise<string> {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new BadRequestException('Google account has no email');

    const providerAccountId = profile.id;

    // Look for existing linked account
    const existingAccount = await this.prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: 'google', providerAccountId } },
      include: { user: true },
    });

    if (existingAccount) {
      return this.createSession(existingAccount.userId, req);
    }

    // No linked account — find or create user by email
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // New user via Google: no password (store random bcrypt hash), mark email verified
      const passwordHash = await bcrypt.hash(randomUUID(), BCRYPT_ROUNDS);
      user = await this.prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: { email, passwordHash, emailVerifiedAt: new Date() },
        });
        await tx.profile.create({ data: { userId: u.id } });
        return u;
      });
    } else if (!user.emailVerifiedAt) {
      // Existing unverified user: mark as verified via Google
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    }

    // Link the Google account
    await this.prisma.account.create({
      data: { userId: user.id, provider: 'google', providerAccountId },
    });

    return this.createSession(user.id, req);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async createSession(userId: string, req: Request): Promise<string> {
    const sessionId = randomUUID();
    const expiresIn = this.config.get<string>('JWT_EXPIRATION', '7d');
    const expiresAt = this.parseExpiry(expiresIn);

    const accessToken = this.jwtService.sign(
      { sub: userId, sid: sessionId },
      { expiresIn: expiresIn as any },
    );

    const tokenHash = createHash('sha256').update(accessToken).digest('hex');

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId,
        tokenHash,
        expiresAt,
        userAgent: req.headers['user-agent'] ?? null,
        ipAddress: (req.headers['x-forwarded-for'] as string | undefined)
          ?.split(',')[0]
          ?.trim() ?? req.socket.remoteAddress ?? null,
      },
    });

    return accessToken;
  }

  private parseExpiry(expiresIn: string): Date {
    const units: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) throw new Error(`Invalid JWT_EXPIRATION format: "${expiresIn}"`);
    return new Date(Date.now() + Number(match[1]) * units[match[2]]);
  }

  private toSafeUser(user: {
    id: string;
    email: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    roles: Array<{ role: { name: string } }>;
  }): SafeUser {
    return {
      id: user.id,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      roles: user.roles,
    };
  }
}
