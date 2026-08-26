import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Inventory, InventorySchema } from './schemas/inventory.schema.js';
import { InventoryHistory, InventoryHistorySchema } from './schemas/inventory-history.schema.js';
import { InventoryRepository } from './repositories/inventory.repository.js';
import { InventoryHistoryRepository } from './repositories/inventory-history.repository.js';
import { InventoryService } from './inventory.service.js';
import { InventoryController } from './inventory.controller.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: InventoryHistory.name, schema: InventoryHistorySchema },
    ]),
    ProductsModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, InventoryHistoryRepository],
  exports: [InventoryService, InventoryRepository, InventoryHistoryRepository],
})
export class InventoryModule {}
