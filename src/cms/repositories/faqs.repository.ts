import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Faq, FaqDocument } from '../schemas/faq.schema.js';

@Injectable()
export class FaqsRepository {
  constructor(
    @InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>,
  ) {}

  async create(data: Partial<Faq>): Promise<FaqDocument> {
    const faq = new this.faqModel(data);
    return faq.save();
  }

  async findById(id: string): Promise<FaqDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.faqModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).exec();
  }

  async findAllActiveGrouped(): Promise<Record<string, FaqDocument[]>> {
    const faqs = await this.faqModel
      .find({ isActive: true, isDeleted: false })
      .sort({ category: 1, displayOrder: 1 })
      .exec();

    const grouped: Record<string, FaqDocument[]> = {};
    for (const faq of faqs) {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    }
    return grouped;
  }

  async findAllAdmin(): Promise<FaqDocument[]> {
    return this.faqModel
      .find({ isDeleted: false })
      .sort({ category: 1, displayOrder: 1 })
      .exec();
  }

  async update(id: string, updateData: Partial<Faq>): Promise<FaqDocument | null> {
    return this.faqModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<FaqDocument | null> {
    return this.faqModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
      .exec();
  }
}
