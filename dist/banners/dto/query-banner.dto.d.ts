import { BannerType, BannerPosition } from '../schemas/banner.schema.js';
export declare class QueryBannerDto {
    type?: BannerType;
    position?: BannerPosition;
    isActive?: boolean;
    _t?: string;
}
