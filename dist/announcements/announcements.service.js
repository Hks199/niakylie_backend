"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const announcements_repository_js_1 = require("./repositories/announcements.repository.js");
const notifications_service_js_1 = require("../notifications/notifications.service.js");
const notification_schema_js_1 = require("../notifications/schemas/notification.schema.js");
let AnnouncementsService = class AnnouncementsService {
    announcementsRepository;
    notificationsService;
    constructor(announcementsRepository, notificationsService) {
        this.announcementsRepository = announcementsRepository;
        this.notificationsService = notificationsService;
    }
    async dispatchAnnouncementNotification(announcement) {
        try {
            const badgeText = announcement.badge ? `[${announcement.badge}] ` : '';
            const title = `📢 ${badgeText}New Offer Announcement`;
            const message = announcement.text;
            await this.notificationsService.broadcastNotification({
                type: notification_schema_js_1.NotificationType.OFFER,
                channel: notification_schema_js_1.NotificationChannel.IN_APP,
                title,
                message,
                metadata: {
                    link: announcement.link || '/products',
                    announcementId: announcement._id?.toString(),
                    badge: announcement.badge,
                },
            });
        }
        catch (err) {
            console.error('[AnnouncementsService] Error broadcasting notification for announcement:', err);
        }
    }
    async create(createDto) {
        const announcement = await this.announcementsRepository.create(createDto);
        if (announcement.isActive !== false) {
            await this.dispatchAnnouncementNotification(announcement);
        }
        return announcement;
    }
    async findAll(queryDto) {
        return this.announcementsRepository.findAll(queryDto);
    }
    async findActiveAnnouncements() {
        return this.announcementsRepository.findActiveAnnouncements();
    }
    async findById(id) {
        const announcement = await this.announcementsRepository.findById(id);
        if (!announcement) {
            throw new common_1.NotFoundException(`Announcement with ID '${id}' not found`);
        }
        return announcement;
    }
    async update(id, updateDto) {
        const previous = await this.findById(id);
        const updated = await this.announcementsRepository.update(id, updateDto);
        if (!updated) {
            throw new common_1.NotFoundException(`Announcement with ID '${id}' not found`);
        }
        if (!previous.isActive && updated.isActive) {
            await this.dispatchAnnouncementNotification(updated);
        }
        return updated;
    }
    async toggleStatus(id) {
        const announcement = await this.findById(id);
        const newActiveState = !announcement.isActive;
        const updated = await this.announcementsRepository.update(id, { isActive: newActiveState });
        if (!updated) {
            throw new common_1.NotFoundException(`Announcement with ID '${id}' not found`);
        }
        if (newActiveState) {
            await this.dispatchAnnouncementNotification(updated);
        }
        return updated;
    }
    async softDelete(id) {
        const deleted = await this.announcementsRepository.softDelete(id);
        if (!deleted) {
            throw new common_1.NotFoundException(`Announcement with ID '${id}' not found`);
        }
        return deleted;
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [announcements_repository_js_1.AnnouncementsRepository,
        notifications_service_js_1.NotificationsService])
], AnnouncementsService);
//# sourceMappingURL=announcements.service.js.map