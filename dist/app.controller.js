"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const app_service_js_1 = require("./app.service.js");
let AppController = class AppController {
    appService;
    health;
    mongooseHealth;
    constructor(appService, health, mongooseHealth) {
        this.appService = appService;
        this.health = health;
        this.mongooseHealth = mongooseHealth;
    }
    getAppInfo() {
        return this.appService.getAppInfo();
    }
    checkHealth() {
        return this.health.check([
            () => this.mongooseHealth.pingCheck('mongodb'),
        ]);
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, throttler_1.SkipThrottle)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get application info' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AppController.prototype, "getAppInfo", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, throttler_1.SkipThrottle)(),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Application is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "checkHealth", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('App'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_js_1.AppService,
        terminus_1.HealthCheckService,
        terminus_1.MongooseHealthIndicator])
], AppController);
//# sourceMappingURL=app.controller.js.map