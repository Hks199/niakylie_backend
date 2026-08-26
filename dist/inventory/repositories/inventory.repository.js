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
exports.InventoryRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const inventory_schema_js_1 = require("../schemas/inventory.schema.js");
let InventoryRepository = class InventoryRepository {
    inventoryModel;
    constructor(inventoryModel) {
        this.inventoryModel = inventoryModel;
    }
    async create(data) {
        const inventory = new this.inventoryModel(data);
        return inventory.save();
    }
    async findBySku(sku) {
        return this.inventoryModel
            .findOne({ sku, isDeleted: false })
            .populate('productId', 'name slug variants')
            .exec();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.inventoryModel
            .findOne({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false })
            .populate('productId', 'name slug variants')
            .exec();
    }
    async findByProductAndVariant(productId, variantId) {
        if (!mongoose_2.Types.ObjectId.isValid(productId))
            return null;
        const filter = {
            productId: new mongoose_2.Types.ObjectId(productId),
            isDeleted: false,
        };
        if (variantId && mongoose_2.Types.ObjectId.isValid(variantId)) {
            filter.variantId = new mongoose_2.Types.ObjectId(variantId);
        }
        return this.inventoryModel.findOne(filter).exec();
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, status, lowStockOnly, sortBy = 'updatedAt', sortOrder = 'asc', } = queryDto;
        const filter = { isDeleted: false };
        if (search) {
            filter.sku = { $regex: search, $options: 'i' };
        }
        if (status) {
            filter.status = status;
        }
        else if (lowStockOnly) {
            filter.status = { $in: [inventory_schema_js_1.StockStatus.LOW_STOCK, inventory_schema_js_1.StockStatus.OUT_OF_STOCK] };
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.inventoryModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('productId', 'name slug')
                .exec(),
            this.inventoryModel.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async update(id, updateData) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.inventoryModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }, updateData, { new: true })
            .exec();
    }
    async updateBySku(sku, updateData) {
        return this.inventoryModel
            .findOneAndUpdate({ sku, isDeleted: false }, updateData, { new: true })
            .exec();
    }
    async reserveStockAtomic(sku, quantity) {
        return this.inventoryModel
            .findOneAndUpdate({
            sku,
            isDeleted: false,
            availableStock: { $gte: quantity },
        }, [
            {
                $set: {
                    reservedStock: { $add: ['$reservedStock', quantity] },
                    availableStock: { $subtract: ['$totalStock', { $add: ['$reservedStock', quantity] }] },
                    status: {
                        $cond: {
                            if: { $lte: [{ $subtract: ['$totalStock', { $add: ['$reservedStock', quantity] }] }, 0] },
                            then: inventory_schema_js_1.StockStatus.OUT_OF_STOCK,
                            else: {
                                $cond: {
                                    if: {
                                        $lte: [
                                            { $subtract: ['$totalStock', { $add: ['$reservedStock', quantity] }] },
                                            '$lowStockThreshold',
                                        ],
                                    },
                                    then: inventory_schema_js_1.StockStatus.LOW_STOCK,
                                    else: inventory_schema_js_1.StockStatus.IN_STOCK,
                                },
                            },
                        },
                    },
                },
            },
        ], { new: true })
            .exec();
    }
};
exports.InventoryRepository = InventoryRepository;
exports.InventoryRepository = InventoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(inventory_schema_js_1.Inventory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], InventoryRepository);
//# sourceMappingURL=inventory.repository.js.map