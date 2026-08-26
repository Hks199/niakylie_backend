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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryHistoryRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const inventory_history_schema_js_1 = require("../schemas/inventory-history.schema.js");
let InventoryHistoryRepository = class InventoryHistoryRepository {
    historyModel;
    constructor(historyModel) {
        this.historyModel = historyModel;
    }
    async create(data) {
        const history = new this.historyModel(data);
        return history.save();
    }
    async findAll(queryDto) {
        const { page = 1, limit = 20, sku, adjustmentType } = queryDto;
        const filter = {};
        if (sku) {
            filter.sku = sku;
        }
        if (adjustmentType) {
            filter.adjustmentType = adjustmentType;
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.historyModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('adjustedBy', 'firstName lastName email')
                .exec(),
            this.historyModel.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
};
exports.InventoryHistoryRepository = InventoryHistoryRepository;
exports.InventoryHistoryRepository = InventoryHistoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(inventory_history_schema_js_1.InventoryHistory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], InventoryHistoryRepository);
//# sourceMappingURL=inventory-history.repository.js.map