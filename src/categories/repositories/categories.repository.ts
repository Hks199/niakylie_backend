import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema.js';
import { QueryCategoryDto } from '../dto/query-category.dto.js';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(categoryData: Partial<Category>): Promise<CategoryDocument> {
    const category = new this.categoryModel(categoryData);
    return category.save();
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.categoryModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).exec();
  }

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({ slug, isDeleted: false }).exec();
  }

  async findAll(queryDto: QueryCategoryDto): Promise<{ data: CategoryDocument[]; total: number }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'asc', parentId, status } = queryDto;
    const filter: Record<string, any> = { isDeleted: false };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (parentId !== undefined) {
      if (parentId === 'null') {
        filter.parentId = null;
      } else if (Types.ObjectId.isValid(parentId)) {
        filter.parentId = new Types.ObjectId(parentId);
      }
    }

    if (status !== undefined) {
      filter.status = status;
    }

    const sort: Record<string, any> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.categoryModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.categoryModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async update(id: string, updateData: UpdateQuery<CategoryDocument>): Promise<CategoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.categoryModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<CategoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.categoryModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();
  }

  async findDirectChildren(parentId: string): Promise<CategoryDocument[]> {
    if (!Types.ObjectId.isValid(parentId)) return [];
    return this.categoryModel
      .find({ parentId: new Types.ObjectId(parentId), isDeleted: false })
      .exec();
  }

  async findDescendants(categoryId: string): Promise<CategoryDocument[]> {
    if (!Types.ObjectId.isValid(categoryId)) return [];
    return this.categoryModel
      .find({ 'ancestors._id': new Types.ObjectId(categoryId), isDeleted: false })
      .exec();
  }

  async softDeleteDescendants(categoryId: string): Promise<void> {
    if (!Types.ObjectId.isValid(categoryId)) return;
    await this.categoryModel
      .updateMany(
        { 'ancestors._id': new Types.ObjectId(categoryId), isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();
  }
}
