import { BannerType, BannerPosition } from '../schemas/banner.schema.js';
export declare class CreateBannerDto {
    title: string;
    subtitle?: string;
    type: BannerType;
    position?: BannerPosition;
    linkUrl?: string;
    linkLabel?: string;
    displayOrder?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    metadata?: Record<string, any>;
}
