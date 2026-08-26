import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{
      user?: Record<string, unknown>;
    }>();
    const user = request.user;

    // If a specific field is requested, return only that field
    if (data && user) {
      return user[data];
    }

    return user;
  },
);
