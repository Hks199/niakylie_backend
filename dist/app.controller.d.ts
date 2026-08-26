import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { AppService } from './app.service.js';
export declare class AppController {
    private readonly appService;
    private readonly health;
    private readonly mongooseHealth;
    constructor(appService: AppService, health: HealthCheckService, mongooseHealth: MongooseHealthIndicator);
    getAppInfo(): {
        name: string;
        version: string;
        description: string;
        status: string;
    };
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"mongodb">, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"mongodb">> | undefined, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"mongodb">> | undefined>>;
}
