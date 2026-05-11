import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      // Disable Passport's own session-based CSRF state so our custom locale
      // state (forwarded via getAuthenticateOptions in GoogleAuthGuard) passes
      // through to Google and back without being replaced or validated.
      state: false,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<void> {
    // Pass the raw Google profile to the controller; all logic lives in AuthService
    done(null, profile);
  }
}
