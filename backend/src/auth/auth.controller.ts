import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentSessionId, CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleProfile } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) { }

  // ─── Registration ─────────────────────────────────────────────────────────

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {

    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  // ─── Login / Logout ───────────────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentSessionId() sessionId: string) {
    return this.authService.logout(sessionId);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  logoutAll(@CurrentUser() user: { id: string }) {
    return this.authService.logoutAll(user.id);
  }

  // ─── Current User ─────────────────────────────────────────────────────────

  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }

  // ─── Password Reset ───────────────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Passport redirects to Google — no body needed
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const accessToken = await this.authService.handleGoogleOAuth(
      req.user as GoogleProfile,
      req,
    );
    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    // Decode locale (and optional redirectTo) from the OAuth state param.
    // The frontend encoded it as btoa(JSON.stringify({ locale, redirectTo })).
    const rawState = req.query.state as string | undefined;
    let locale = 'en';
    let redirectTo = '/home';
    if (rawState) {
      try {
        const decoded = JSON.parse(
          Buffer.from(rawState, 'base64').toString('utf-8'),
        ) as { locale?: string; redirectTo?: string };
        if (typeof decoded.locale === 'string' && decoded.locale) {
          locale = decoded.locale;
        }
        if (typeof decoded.redirectTo === 'string' && decoded.redirectTo) {
          redirectTo = decoded.redirectTo;
        }
      } catch {
        // malformed state — fall back to defaults
      }
    }

    // /auth/callback stores the token, updates the store, then pushes to redirectTo
    res.redirect(
      `${frontendUrl}/${locale}/auth/callback?token=${accessToken}&redirectTo=${encodeURIComponent(redirectTo)}`,
    );
  }
}
