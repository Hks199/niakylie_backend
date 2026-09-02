import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Announcement, AnnouncementDocument } from '../schemas/announcement.schema.js';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from '../dto/update-announcement.dto.js';
import { QueryAnnouncementDto } from '../dto/query-announcement.dto.js';

@Injectable()
export class AnnouncementsRepository {
  constructor(
    @InjectModel(Announcement.name)
    private readonly announcementModel: Model<AnnouncementDocument>,
  ) {}

  async create(createDto: CreateAnnouncementDto): Promise<AnnouncementDocument> {
    const created = new this.announcementModel(createDto);
    return created.save();
  }

  async findAll(queryDto: QueryAnnouncementDto): Promise<{
    data: AnnouncementDocument[];
    total: number;
    page: number;
    limit: number;
    stats: { total: number; active: number };
  }> {
    const { page = 1, limit = 10, search, isActive } = queryDto;
    const filter: Record<string, any> = { isDeleted: false };

    if (isActive !== undefined && isActive !== null && (isActive as any) !== '') {
      filter.isActive = String(isActive) === 'true';
    }

    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: 'i' } },
        { badge: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const baseFilter = { isDeleted: false };

    const [data, total, totalAll, activeCount] = await Promise.all([
      this.announcementModel
        .find(filter)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.announcementModel.countDocuments(filter).exec(),
      this.announcementModel.countDocuments(baseFilter).exec(),
      this.announcementModel.countDocuments({ ...baseFilter, isActive: true }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      stats: {
        total: totalAll,
        active: activeCount,
      },
    };
  }

  async findActiveAnnouncements(): Promise<AnnouncementDocument[]> {
    return this.announcementModel
      .find({ isDeleted: false, isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<AnnouncementDocument | null> {
    return this.announcementModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async update(id: string, updateDto: UpdateAnnouncementDto): Promise<AnnouncementDocument | null> {
    return this.announcementModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { $set: updateDto }, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<AnnouncementDocument | null> {
    return this.announcementModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true, isActive: false } }, { new: true })
      .exec();
  }
}
