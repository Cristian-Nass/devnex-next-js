import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  /**
   * Forward the raw `?state=` query param from the initiating request through
   * to Passport so Google includes it unchanged in the OAuth callback URL.
   */
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const state = req.query.state as string | undefined;
    return state ? { state } : {};
  }
}
