import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { Inventory, InventoryDocument, StockStatus } from '../schemas/inventory.schema.js';
import { QueryInventoryDto } from '../dto/query-inventory.dto.js';

@Injectable()
export class InventoryRepository {
  constructor(
    @InjectModel(Inventory.name) private readonly inventoryModel: Model<InventoryDocument>,
  ) {}

  async create(data: Partial<Inventory>): Promise<InventoryDocument> {
    const inventory = new this.inventoryModel(data);
    return inventory.save();
  }

  async findBySku(sku: string): Promise<InventoryDocument | null> {
    return this.inventoryModel
      .findOne({ sku, isDeleted: false })
      .populate('productId', 'name slug variants')
      .exec();
  }

  async findById(id: string): Promise<InventoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.inventoryModel
      .findOne({ _id: new Types.ObjectId(id), isDeleted: false })
      .populate('productId', 'name slug variants')
      .exec();
  }

  async findByProductAndVariant(
    productId: string,
    variantId?: string,
  ): Promise<InventoryDocument | null> {
    if (!Types.ObjectId.isValid(productId)) return null;
    const filter: Record<string, any> = {
      productId: new Types.ObjectId(productId),
      isDeleted: false,
    };
    if (variantId && Types.ObjectId.isValid(variantId)) {
      filter.variantId = new Types.ObjectId(variantId);
    }
    return this.inventoryModel.findOne(filter).exec();
  }

  async findAll(queryDto: QueryInventoryDto): Promise<{ data: InventoryDocument[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      lowStockOnly,
      sortBy = 'updatedAt',
      sortOrder = 'asc',
    } = queryDto;

    const filter: Record<string, any> = { isDeleted: false };

    if (search) {
      filter.sku = { $regex: search, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    } else if (lowStockOnly) {
      filter.status = { $in: [StockStatus.LOW_STOCK, StockStatus.OUT_OF_STOCK] };
    }

    const sort: Record<string, any> = {};
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

  async update(id: string, updateData: UpdateQuery<InventoryDocument>): Promise<InventoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.inventoryModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async updateBySku(sku: string, updateData: UpdateQuery<InventoryDocument>): Promise<InventoryDocument | null> {
    return this.inventoryModel
      .findOneAndUpdate({ sku, isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async reserveStockAtomic(sku: string, quantity: number): Promise<InventoryDocument | null> {
    // Atomically ensure availableStock >= quantity before incrementing reservedStock
    return this.inventoryModel
      .findOneAndUpdate(
        {
          sku,
          isDeleted: false,
          availableStock: { $gte: quantity },
        },
        [
          {
            $set: {
              reservedStock: { $add: ['$reservedStock', quantity] },
              availableStock: { $subtract: ['$totalStock', { $add: ['$reservedStock', quantity] }] },
              status: {
                $cond: {
                  if: { $lte: [{ $subtract: ['$totalStock', { $add: ['$reservedStock', quantity] }] }, 0] },
                  then: StockStatus.OUT_OF_STOCK,
                  else: {
                    $cond: {
                      if: {
                        $lte: [
                          { $subtract: ['$totalStock', { $add: ['$reservedStock', quantity] }] },
                          '$lowStockThreshold',
                        ],
                      },
                      then: StockStatus.LOW_STOCK,
                      else: StockStatus.IN_STOCK,
                    },
                  },
                },
              },
            },
          },
        ],
        { new: true },
      )
      .exec();
  }
}
