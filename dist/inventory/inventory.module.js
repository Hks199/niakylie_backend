"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const inventory_schema_js_1 = require("./schemas/inventory.schema.js");
const inventory_history_schema_js_1 = require("./schemas/inventory-history.schema.js");
const inventory_repository_js_1 = require("./repositories/inventory.repository.js");
const inventory_history_repository_js_1 = require("./repositories/inventory-history.repository.js");
const inventory_service_js_1 = require("./inventory.service.js");
const inventory_controller_js_1 = require("./inventory.controller.js");
const products_module_js_1 = require("../products/products.module.js");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: inventory_schema_js_1.Inventory.name, schema: inventory_schema_js_1.InventorySchema },
                { name: inventory_history_schema_js_1.InventoryHistory.name, schema: inventory_history_schema_js_1.InventoryHistorySchema },
            ]),
            products_module_js_1.ProductsModule,
        ],
        controllers: [inventory_controller_js_1.InventoryController],
        providers: [inventory_service_js_1.InventoryService, inventory_repository_js_1.InventoryRepository, inventory_history_repository_js_1.InventoryHistoryRepository],
        exports: [inventory_service_js_1.InventoryService, inventory_repository_js_1.InventoryRepository, inventory_history_repository_js_1.InventoryHistoryRepository],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map