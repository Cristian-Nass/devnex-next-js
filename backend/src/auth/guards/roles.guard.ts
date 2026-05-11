import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface UserWithRoles {
  roles?: Array<{ role: { name: string } }>;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const user = context.switchToHttp().getRequest<{ user: UserWithRoles }>()
      .user;
    if (!user) return false;

    const userRoles = user.roles?.map((ur) => ur.role.name) ?? [];
    return required.some((r) => userRoles.includes(r));
  }
}
