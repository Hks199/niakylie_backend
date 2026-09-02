import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from '../schemas/coupon.schema.js';
import { CreateCouponDto } from '../dto/create-coupon.dto.js';
import { UpdateCouponDto } from '../dto/update-coupon.dto.js';
import { QueryCouponDto } from '../dto/query-coupon.dto.js';

@Injectable()
export class CouponsRepository {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
  ) {}

  async create(createDto: CreateCouponDto): Promise<CouponDocument> {
    const coupon = new this.couponModel({
      ...createDto,
      code: createDto.code.toUpperCase().trim(),
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
    });
    return coupon.save();
  }

  async findById(id: string): Promise<CouponDocument | null> {
    return this.couponModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async findByCode(code: string): Promise<CouponDocument | null> {
    return this.couponModel
      .findOne({ code: code.toUpperCase().trim(), isDeleted: false })
      .exec();
  }

  async findActiveCoupons(): Promise<CouponDocument[]> {
    const now = new Date();
    return this.couponModel
      .find({
        isActive: true,
        isDeleted: false,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(queryDto: QueryCouponDto): Promise<{ data: CouponDocument[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, isActive } = queryDto;
    const filter: Record<string, any> = { isDeleted: false };

    if (isActive !== undefined && isActive !== null && (isActive as any) !== '') {
      filter.isActive = String(isActive) === 'true';
    }

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.couponModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.couponModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, updateDto: UpdateCouponDto): Promise<CouponDocument | null> {
    const updateData: any = { ...updateDto };

    if (updateDto.code) {
      updateData.code = updateDto.code.toUpperCase().trim();
    }
    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      updateData.endDate = new Date(updateDto.endDate);
    }

    return this.couponModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async incrementUsedCount(id: string): Promise<CouponDocument | null> {
    return this.couponModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { $inc: { usedCount: 1 } }, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<CouponDocument | null> {
    return this.couponModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date(), isActive: false },
        { new: true },
      )
      .exec();
  }
}
