import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  override handleRequest(err: unknown, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Refresh token is invalid or expired');
    }
    return user;
  }
}
