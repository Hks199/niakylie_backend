import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InventoryHistory, InventoryHistoryDocument } from '../schemas/inventory-history.schema.js';
import { QueryInventoryHistoryDto } from '../dto/query-inventory-history.dto.js';

@Injectable()
export class InventoryHistoryRepository {
  constructor(
    @InjectModel(InventoryHistory.name)
    private readonly historyModel: Model<InventoryHistoryDocument>,
  ) {}

  async create(data: Partial<InventoryHistory>): Promise<InventoryHistoryDocument> {
    const history = new this.historyModel(data);
    return history.save();
  }

  async findAll(queryDto: QueryInventoryHistoryDto): Promise<{ data: InventoryHistoryDocument[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, sku, adjustmentType } = queryDto;
    const filter: Record<string, any> = {};

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
}
