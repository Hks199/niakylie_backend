import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Page, PageDocument } from '../schemas/page.schema.js';

@Injectable()
export class PagesRepository {
  constructor(
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
  ) {}

  async create(data: Partial<Page>): Promise<PageDocument> {
    const page = new this.pageModel(data);
    return page.save();
  }

  async findById(id: string): Promise<PageDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.pageModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).exec();
  }

  async findBySlug(slug: string): Promise<PageDocument | null> {
    return this.pageModel.findOne({ slug, isDeleted: false }).exec();
  }

  async findAllPublished(): Promise<PageDocument[]> {
    return this.pageModel
      .find({ isPublished: true, isDeleted: false })
      .select('-content')
      .sort({ title: 1 })
      .exec();
  }

  async findAllAdmin(): Promise<PageDocument[]> {
    return this.pageModel.find({ isDeleted: false }).sort({ updatedAt: -1 }).exec();
  }

  async update(id: string, updateData: Partial<Page>): Promise<PageDocument | null> {
    return this.pageModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<PageDocument | null> {
    return this.pageModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
      .exec();
  }
}
