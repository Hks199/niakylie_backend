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
exports.InventorySchema = exports.Inventory = exports.StockStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var StockStatus;
(function (StockStatus) {
    StockStatus["IN_STOCK"] = "IN_STOCK";
    StockStatus["LOW_STOCK"] = "LOW_STOCK";
    StockStatus["OUT_OF_STOCK"] = "OUT_OF_STOCK";
})(StockStatus || (exports.StockStatus = StockStatus = {}));
let Inventory = class Inventory {
    productId;
    variantId;
    sku;
    totalStock;
    reservedStock;
    availableStock;
    soldStock;
    lowStockThreshold;
    status;
    isDeleted;
    deletedAt;
};
exports.Inventory = Inventory;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Product', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Inventory.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Inventory.prototype, "variantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true, index: true }),
    __metadata("design:type", String)
], Inventory.prototype, "sku", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "totalStock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "reservedStock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0, index: true }),
    __metadata("design:type", Number)
], Inventory.prototype, "availableStock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "soldStock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 5, min: 0 }),
    __metadata("design:type", Number)
], Inventory.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(StockStatus),
        default: StockStatus.OUT_OF_STOCK,
        index: true,
    }),
    __metadata("design:type", String)
], Inventory.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Inventory.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Inventory.prototype, "deletedAt", void 0);
exports.Inventory = Inventory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Inventory);
exports.InventorySchema = mongoose_1.SchemaFactory.createForClass(Inventory);
exports.InventorySchema.index({ sku: 1 }, { unique: true });
exports.InventorySchema.index({ productId: 1, variantId: 1 });
exports.InventorySchema.index({ status: 1 });
exports.InventorySchema.index({ availableStock: 1 });
//# sourceMappingURL=inventory.schema.js.map