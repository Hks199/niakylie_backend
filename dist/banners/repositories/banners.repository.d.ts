import { Model } from 'mongoose';
import { Banner, BannerDocument } from '../schemas/banner.schema.js';
import { QueryBannerDto } from '../dto/query-banner.dto.js';
export declare class BannersRepository {
    private readonly bannerModel;
    constructor(bannerModel: Model<BannerDocument>);
    create(data: Partial<Banner>): Promise<BannerDocument>;
    findById(id: string): Promise<BannerDocument | null>;
    findActive(query: QueryBannerDto): Promise<BannerDocument[]>;
    findAll(query: QueryBannerDto): Promise<BannerDocument[]>;
    update(id: string, updateData: Partial<Banner>): Promise<BannerDocument | null>;
    softDelete(id: string): Promise<BannerDocument | null>;
}
