import { BannersService } from './banners.service.js';
import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';
import { QueryBannerDto } from './dto/query-banner.dto.js';
export declare class BannersController {
    private readonly bannersService;
    constructor(bannersService: BannersService);
    getActiveBanners(query: QueryBannerDto): Promise<import("./schemas/banner.schema.js").BannerDocument[]>;
    getBannerById(id: string): Promise<import("./schemas/banner.schema.js").BannerDocument>;
    getAllBanners(query: QueryBannerDto): Promise<import("./schemas/banner.schema.js").BannerDocument[]>;
    createBanner(dto: CreateBannerDto, files: {
        image?: Express.Multer.File[];
        mobileImage?: Express.Multer.File[];
    }): Promise<import("./schemas/banner.schema.js").BannerDocument>;
    updateBanner(id: string, dto: UpdateBannerDto, files: {
        image?: Express.Multer.File[];
        mobileImage?: Express.Multer.File[];
    }): Promise<import("./schemas/banner.schema.js").BannerDocument>;
    toggleActive(id: string): Promise<import("./schemas/banner.schema.js").BannerDocument>;
    reorder(body: Array<{
        id: string;
        displayOrder: number;
    }>): Promise<{
        message: string;
    }>;
    deleteBanner(id: string): Promise<{
        message: string;
    }>;
}
