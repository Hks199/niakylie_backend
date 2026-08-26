import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { AppService } from './app.service.js';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly health: HealthCheckService,
    private readonly mongooseHealth: MongooseHealthIndicator,
  ) {}

  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: 'Get application info' })
  @ApiResponse({ status: 200, description: 'Application information' })
  getAppInfo(): {
    name: string;
    version: string;
    description: string;
    status: string;
  } {
    return this.appService.getAppInfo();
  }

  @Get('health')
  @SkipThrottle()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  checkHealth() {
    return this.health.check([
      () => this.mongooseHealth.pingCheck('mongodb'),
    ]);
  }
}
