import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Banner, BannerDocument } from '../schemas/banner.schema.js';
import { QueryBannerDto } from '../dto/query-banner.dto.js';

@Injectable()
export class BannersRepository {
  constructor(
    @InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>,
  ) {}

  async create(data: Partial<Banner>): Promise<BannerDocument> {
    const banner = new this.bannerModel(data);
    return banner.save();
  }

  async findById(id: string): Promise<BannerDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.bannerModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).exec();
  }

  /**
   * Public-facing query: returns only active banners within scheduling window.
   */
  async findActive(query: QueryBannerDto): Promise<BannerDocument[]> {
    const now = new Date();
    const filter: Record<string, any> = {
      isActive: true,
      isDeleted: false,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
      ],
    };

    if (query.type) filter.type = query.type;

    return this.bannerModel
      .find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .exec();
  }

  /**
   * Admin query: all banners (active or not), no scheduling filter.
   */
  async findAll(query: QueryBannerDto): Promise<BannerDocument[]> {
    const filter: Record<string, any> = { isDeleted: false };
    if (query.type) filter.type = query.type;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    return this.bannerModel
      .find(filter)
      .sort({ type: 1, displayOrder: 1, createdAt: -1 })
      .exec();
  }

  async update(id: string, updateData: Partial<Banner>): Promise<BannerDocument | null> {
    return this.bannerModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<BannerDocument | null> {
    return this.bannerModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
      .exec();
  }
}
