import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo(): {
    name: string;
    version: string;
    description: string;
    status: string;
  } {
    return {
      name: 'NiaKylie Fashion API',
      version: '1.0.0',
      description: "Women's Fashion E-Commerce Platform API",
      status: 'running',
    };
  }
}
