import { Injectable, NotFoundException } from '@nestjs/common';
import { AnnouncementsRepository } from './repositories/announcements.repository.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';
import { QueryAnnouncementDto } from './dto/query-announcement.dto.js';
import { AnnouncementDocument } from './schemas/announcement.schema.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType, NotificationChannel } from '../notifications/schemas/notification.schema.js';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly announcementsRepository: AnnouncementsRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async dispatchAnnouncementNotification(announcement: AnnouncementDocument) {
    try {
      const badgeText = announcement.badge ? `[${announcement.badge}] ` : '';
      const title = `📢 ${badgeText}New Offer Announcement`;
      const message = announcement.text;

      await this.notificationsService.broadcastNotification({
        type: NotificationType.OFFER,
        channel: NotificationChannel.IN_APP,
        title,
        message,
        metadata: {
          link: announcement.link || '/products',
          announcementId: announcement._id?.toString(),
          badge: announcement.badge,
        },
      });
    } catch (err) {
      console.error('[AnnouncementsService] Error broadcasting notification for announcement:', err);
    }
  }

  async create(createDto: CreateAnnouncementDto): Promise<AnnouncementDocument> {
    const announcement = await this.announcementsRepository.create(createDto);
    if (announcement.isActive !== false) {
      await this.dispatchAnnouncementNotification(announcement);
    }
    return announcement;
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
    const previous = await this.findById(id);
    const updated = await this.announcementsRepository.update(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Announcement with ID '${id}' not found`);
    }
    if (!previous.isActive && updated.isActive) {
      await this.dispatchAnnouncementNotification(updated);
    }
    return updated;
  }

  async toggleStatus(id: string): Promise<AnnouncementDocument> {
    const announcement = await this.findById(id);
    const newActiveState = !announcement.isActive;
    const updated = await this.announcementsRepository.update(id, { isActive: newActiveState });
    if (!updated) {
      throw new NotFoundException(`Announcement with ID '${id}' not found`);
    }
    if (newActiveState) {
      await this.dispatchAnnouncementNotification(updated);
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
