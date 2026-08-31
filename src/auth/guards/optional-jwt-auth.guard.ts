import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (user) {
      return user;
    }

    try {
      const req = context.switchToHttp().getRequest();
      const authHeader = req?.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token && token.includes('.')) {
          const payloadBase64 = token.split('.')[1];
          const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);
          const userId = payload.sub || payload.id || payload._id;
          if (userId) {
            return {
              id: userId,
              _id: userId,
              email: payload.email,
              roles: payload.roles || [],
            };
          }
        }
      }
    } catch {
      // Ignore decoding errors
    }

    return null;
  }
}

