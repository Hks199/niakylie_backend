import { AnnouncementsRepository } from './repositories/announcements.repository.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';
import { QueryAnnouncementDto } from './dto/query-announcement.dto.js';
import { AnnouncementDocument } from './schemas/announcement.schema.js';
import { NotificationsService } from '../notifications/notifications.service.js';
export declare class AnnouncementsService {
    private readonly announcementsRepository;
    private readonly notificationsService;
    constructor(announcementsRepository: AnnouncementsRepository, notificationsService: NotificationsService);
    private dispatchAnnouncementNotification;
    create(createDto: CreateAnnouncementDto): Promise<AnnouncementDocument>;
    findAll(queryDto: QueryAnnouncementDto): Promise<{
        data: AnnouncementDocument[];
        total: number;
        page: number;
        limit: number;
        stats: {
            total: number;
            active: number;
        };
    }>;
    findActiveAnnouncements(): Promise<AnnouncementDocument[]>;
    findById(id: string): Promise<AnnouncementDocument>;
    update(id: string, updateDto: UpdateAnnouncementDto): Promise<AnnouncementDocument>;
    toggleStatus(id: string): Promise<AnnouncementDocument>;
    softDelete(id: string): Promise<AnnouncementDocument>;
}
