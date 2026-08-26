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
exports.DashboardQueryDto = exports.AggregationPeriod = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var AggregationPeriod;
(function (AggregationPeriod) {
    AggregationPeriod["DAILY"] = "daily";
    AggregationPeriod["WEEKLY"] = "weekly";
    AggregationPeriod["MONTHLY"] = "monthly";
    AggregationPeriod["YEARLY"] = "yearly";
})(AggregationPeriod || (exports.AggregationPeriod = AggregationPeriod = {}));
class DashboardQueryDto {
    startDate;
    endDate;
    period;
    limit;
}
exports.DashboardQueryDto = DashboardQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-01-01T00:00:00Z', description: 'Start date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DashboardQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-12-31T23:59:59Z', description: 'End date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DashboardQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: AggregationPeriod, example: AggregationPeriod.MONTHLY, description: 'Grouping period for revenue chart' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AggregationPeriod),
    __metadata("design:type", String)
], DashboardQueryDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, description: 'Number of top items to return' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], DashboardQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=dashboard-query.dto.js.map