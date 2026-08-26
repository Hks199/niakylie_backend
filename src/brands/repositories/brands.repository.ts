import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { Brand, BrandDocument } from '../schemas/brand.schema.js';
import { QueryBrandDto } from '../dto/query-brand.dto.js';

@Injectable()
export class BrandsRepository {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
  ) {}

  async create(brandData: Partial<Brand>): Promise<BrandDocument> {
    const brand = new this.brandModel(brandData);
    return brand.save();
  }

  async findById(id: string): Promise<BrandDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.brandModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).exec();
  }

  async findBySlug(slug: string): Promise<BrandDocument | null> {
    return this.brandModel.findOne({ slug, isDeleted: false }).exec();
  }

  async findByIdOrSlug(idOrSlug: string): Promise<BrandDocument | null> {
    if (Types.ObjectId.isValid(idOrSlug)) {
      const brand = await this.brandModel
        .findOne({ _id: new Types.ObjectId(idOrSlug), isDeleted: false })
        .exec();
      if (brand) return brand;
    }
    return this.brandModel.findOne({ slug: idOrSlug, isDeleted: false }).exec();
  }

  async findAll(queryDto: QueryBrandDto): Promise<{ data: BrandDocument[]; total: number }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;
    const filter: Record<string, any> = { isDeleted: false };

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [{ name: searchRegex }, { slug: searchRegex }];
    }

    const sort: Record<string, any> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.brandModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.brandModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async update(id: string, updateData: UpdateQuery<BrandDocument>): Promise<BrandDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.brandModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<BrandDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.brandModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), isDeleted: false },
        { $set: { isDeleted: true, status: false, deletedAt: new Date() } },
        { new: true },
      )
      .exec();
  }
}

