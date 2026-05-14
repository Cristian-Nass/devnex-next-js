import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { SESSION_COOKIE_NAME, getCookie } from '../session-cookie';

export interface JwtPayload {
  sub: string; // userId
  sid: string; // sessionId
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    super({
      // Accept either `Authorization: Bearer <jwt>` (existing flow) or the
      // cross-subdomain cookie `netmart_session` set on .netmart.se. The cookie
      // is what enables builder.netmart.se / wp.netmart.se to share auth.
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => getCookie(req, SESSION_COOKIE_NAME),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sid,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            roles: { include: { role: true } },
          },
        },
      },
    });

    if (!session) throw new UnauthorizedException('Session expired or revoked');

    // Attach sessionId for use in controllers (e.g. logout)
    (req as Request & { sessionId: string }).sessionId = session.id;

    return session.user;
  }
}
