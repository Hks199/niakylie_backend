import { Model } from 'mongoose';
import { AnnouncementDocument } from '../schemas/announcement.schema.js';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from '../dto/update-announcement.dto.js';
import { QueryAnnouncementDto } from '../dto/query-announcement.dto.js';
export declare class AnnouncementsRepository {
    private readonly announcementModel;
    constructor(announcementModel: Model<AnnouncementDocument>);
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
    findById(id: string): Promise<AnnouncementDocument | null>;
    update(id: string, updateDto: UpdateAnnouncementDto): Promise<AnnouncementDocument | null>;
    softDelete(id: string): Promise<AnnouncementDocument | null>;
}
