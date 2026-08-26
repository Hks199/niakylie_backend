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
exports.InventoryHistorySchema = exports.InventoryHistory = exports.InventoryAdjustmentType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var InventoryAdjustmentType;
(function (InventoryAdjustmentType) {
    InventoryAdjustmentType["RESTOCK"] = "RESTOCK";
    InventoryAdjustmentType["MANUAL_ADJUSTMENT"] = "MANUAL_ADJUSTMENT";
    InventoryAdjustmentType["RESERVE"] = "RESERVE";
    InventoryAdjustmentType["RELEASE_RESERVATION"] = "RELEASE_RESERVATION";
    InventoryAdjustmentType["SALE_DEDUCTION"] = "SALE_DEDUCTION";
    InventoryAdjustmentType["RETURN_RESTOCK"] = "RETURN_RESTOCK";
    InventoryAdjustmentType["DAMAGE_LOSS"] = "DAMAGE_LOSS";
})(InventoryAdjustmentType || (exports.InventoryAdjustmentType = InventoryAdjustmentType = {}));
let InventoryHistory = class InventoryHistory {
    inventoryId;
    productId;
    sku;
    adjustmentType;
    previousStock;
    quantityChanged;
    newStock;
    previousReserved;
    newReserved;
    reason;
    adjustedBy;
};
exports.InventoryHistory = InventoryHistory;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Inventory', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], InventoryHistory.prototype, "inventoryId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Product', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], InventoryHistory.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], InventoryHistory.prototype, "sku", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(InventoryAdjustmentType),
        required: true,
        index: true,
    }),
    __metadata("design:type", String)
], InventoryHistory.prototype, "adjustmentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], InventoryHistory.prototype, "previousStock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], InventoryHistory.prototype, "quantityChanged", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], InventoryHistory.prototype, "newStock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], InventoryHistory.prototype, "previousReserved", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], InventoryHistory.prototype, "newReserved", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], InventoryHistory.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], InventoryHistory.prototype, "adjustedBy", void 0);
exports.InventoryHistory = InventoryHistory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], InventoryHistory);
exports.InventoryHistorySchema = mongoose_1.SchemaFactory.createForClass(InventoryHistory);
exports.InventoryHistorySchema.index({ sku: 1, createdAt: -1 });
exports.InventoryHistorySchema.index({ inventoryId: 1, createdAt: -1 });
//# sourceMappingURL=inventory-history.schema.js.map