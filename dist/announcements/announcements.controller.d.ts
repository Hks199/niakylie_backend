import { AnnouncementsService } from './announcements.service.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';
import { QueryAnnouncementDto } from './dto/query-announcement.dto.js';
export declare class AnnouncementsController {
    private readonly announcementsService;
    constructor(announcementsService: AnnouncementsService);
    findActiveAnnouncements(): Promise<import("./schemas/announcement.schema.js").AnnouncementDocument[]>;
    findAll(queryDto: QueryAnnouncementDto): Promise<{
        data: import("./schemas/announcement.schema.js").AnnouncementDocument[];
        total: number;
        page: number;
        limit: number;
        stats: {
            total: number;
            active: number;
        };
    }>;
    findOne(id: string): Promise<import("./schemas/announcement.schema.js").AnnouncementDocument>;
    create(createDto: CreateAnnouncementDto): Promise<import("./schemas/announcement.schema.js").AnnouncementDocument>;
    update(id: string, updateDto: UpdateAnnouncementDto): Promise<import("./schemas/announcement.schema.js").AnnouncementDocument>;
    toggleStatus(id: string): Promise<import("./schemas/announcement.schema.js").AnnouncementDocument>;
    remove(id: string): Promise<import("./schemas/announcement.schema.js").AnnouncementDocument>;
}
