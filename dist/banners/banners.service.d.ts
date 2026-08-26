import { BannersRepository } from './repositories/banners.repository.js';
import { S3Service } from '../s3/s3.service.js';
import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';
import { QueryBannerDto } from './dto/query-banner.dto.js';
import { BannerDocument } from './schemas/banner.schema.js';
export declare class BannersService {
    private readonly bannersRepo;
    private readonly s3Service;
    constructor(bannersRepo: BannersRepository, s3Service: S3Service);
    getActiveBanners(query: QueryBannerDto): Promise<BannerDocument[]>;
    getBannerById(id: string): Promise<BannerDocument>;
    getAllBanners(query: QueryBannerDto): Promise<BannerDocument[]>;
    createBanner(dto: CreateBannerDto, files: {
        image?: Express.Multer.File[];
        mobileImage?: Express.Multer.File[];
    }): Promise<BannerDocument>;
    updateBanner(id: string, dto: UpdateBannerDto, files?: {
        image?: Express.Multer.File[];
        mobileImage?: Express.Multer.File[];
    }): Promise<BannerDocument>;
    deleteBanner(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<BannerDocument>;
    reorder(bannerOrders: Array<{
        id: string;
        displayOrder: number;
    }>): Promise<{
        message: string;
    }>;
}
