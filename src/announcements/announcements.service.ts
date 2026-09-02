import { Injectable, NotFoundException } from '@nestjs/common';
import { AnnouncementsRepository } from './repositories/announcements.repository.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';
import { QueryAnnouncementDto } from './dto/query-announcement.dto.js';
import { AnnouncementDocument } from './schemas/announcement.schema.js';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly announcementsRepository: AnnouncementsRepository) {}

  async create(createDto: CreateAnnouncementDto): Promise<AnnouncementDocument> {
    return this.announcementsRepository.create(createDto);
  }

  async findAll(queryDto: QueryAnnouncementDto) {
    return this.announcementsRepository.findAll(queryDto);
  }

  async findActiveAnnouncements(): Promise<AnnouncementDocument[]> {
    return this.announcementsRepository.findActiveAnnouncements();
  }

  async findById(id: string): Promise<AnnouncementDocument> {
    const announcement = await this.announcementsRepository.findById(id);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID '${id}' not found`);
    }
    return announcement;
  }

  async update(id: string, updateDto: UpdateAnnouncementDto): Promise<AnnouncementDocument> {
    await this.findById(id);
    const updated = await this.announcementsRepository.update(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Announcement with ID '${id}' not found`);
    }
    return updated;
  }

  async toggleStatus(id: string): Promise<AnnouncementDocument> {
    const announcement = await this.findById(id);
    const updated = await this.announcementsRepository.update(id, { isActive: !announcement.isActive });
    if (!updated) {
      throw new NotFoundException(`Announcement with ID '${id}' not found`);
    }
    return updated;
  }

  async softDelete(id: string): Promise<AnnouncementDocument> {
    const deleted = await this.announcementsRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Announcement with ID '${id}' not found`);
    }
    return deleted;
  }
}
