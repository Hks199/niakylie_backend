import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from '../schemas/subscriber.schema.js';

@Injectable()
export class SubscribersRepository {
  constructor(
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: Model<SubscriberDocument>,
  ) {}

  async createOrUpdate(data: { email?: string; phone?: string; source?: string }): Promise<SubscriberDocument> {
    const filterConditions: any[] = [];
    if (data.email) filterConditions.push({ email: data.email.toLowerCase().trim() });
    if (data.phone) filterConditions.push({ phone: data.phone.trim() });

    if (filterConditions.length > 0) {
      const existing = await this.subscriberModel.findOne({ $or: filterConditions }).exec();
      if (existing) {
        if (data.email) existing.email = data.email.toLowerCase().trim();
        if (data.phone) existing.phone = data.phone.trim();
        if (data.source) existing.source = data.source;
        existing.isActive = true;
        return existing.save();
      }
    }

    const subscriber = new this.subscriberModel({
      email: data.email ? data.email.toLowerCase().trim() : undefined,
      phone: data.phone ? data.phone.trim() : undefined,
      source: data.source || 'FOOTER',
      isActive: true,
      subscribedAt: new Date(),
    });

    return subscriber.save();
  }

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const filter: Record<string, any> = {};

    if (query.search && query.search.trim()) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ email: regex }, { phone: regex }, { source: regex }];
    }

    const skip = (page - 1) * limit;
    const [subscribers, total] = await Promise.all([
      this.subscriberModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.subscriberModel.countDocuments(filter).exec(),
    ]);

    return { subscribers, total, page, limit };
  }

  async deleteById(id: string): Promise<SubscriberDocument | null> {
    return this.subscriberModel.findByIdAndDelete(id).exec();
  }
}
