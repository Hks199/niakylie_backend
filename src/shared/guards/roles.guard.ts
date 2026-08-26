import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { Role } from '../enums/index.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: { role?: Role | string; roles?: (Role | string)[] };
    }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    // Support both user.roles array (Mongoose schema) and user.role string
    const userRoles: string[] = [];
    if (Array.isArray(user.roles)) {
      userRoles.push(...user.roles.map((r) => String(r).toLowerCase()));
    }
    if (user.role) {
      userRoles.push(String(user.role).toLowerCase());
    }

    if (userRoles.length === 0) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    const hasRole = requiredRoles.some((reqRole) =>
      userRoles.includes(String(reqRole).toLowerCase()),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}

