import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest(err: unknown, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Access token is invalid or expired');
    }
    return user;
  }
}
