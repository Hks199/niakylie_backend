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
exports.BannersService = void 0;
const common_1 = require("@nestjs/common");
const banners_repository_js_1 = require("./repositories/banners.repository.js");
const s3_service_js_1 = require("../s3/s3.service.js");
let BannersService = class BannersService {
    bannersRepo;
    s3Service;
    constructor(bannersRepo, s3Service) {
        this.bannersRepo = bannersRepo;
        this.s3Service = s3Service;
    }
    async getActiveBanners(query) {
        return this.bannersRepo.findActive(query);
    }
    async getBannerById(id) {
        const banner = await this.bannersRepo.findById(id);
        if (!banner)
            throw new common_1.NotFoundException(`Banner '${id}' not found`);
        return banner;
    }
    async getAllBanners(query) {
        return this.bannersRepo.findAll(query);
    }
    async createBanner(dto, files) {
        const imageFile = files?.image?.[0];
        if (!imageFile) {
            throw new common_1.BadRequestException('Banner image is required');
        }
        const imageUrl = await this.s3Service.uploadBuffer(imageFile.buffer, 'banners', imageFile.originalname, imageFile.mimetype);
        let mobileImageUrl;
        const mobileFile = files?.mobileImage?.[0];
        if (mobileFile) {
            mobileImageUrl = await this.s3Service.uploadBuffer(mobileFile.buffer, 'banners/mobile', mobileFile.originalname, mobileFile.mimetype);
        }
        return this.bannersRepo.create({
            ...dto,
            imageUrl,
            mobileImageUrl,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            isActive: dto.isActive ?? true,
            displayOrder: dto.displayOrder ?? 0,
        });
    }
    async updateBanner(id, dto, files) {
        const banner = await this.bannersRepo.findById(id);
        if (!banner)
            throw new common_1.NotFoundException(`Banner '${id}' not found`);
        const updateData = { ...dto };
        const imageFile = files?.image?.[0];
        if (imageFile) {
            if (banner.imageUrl) {
                await this.s3Service.deleteByUrl(banner.imageUrl).catch(() => { });
            }
            updateData.imageUrl = await this.s3Service.uploadBuffer(imageFile.buffer, 'banners', imageFile.originalname, imageFile.mimetype);
        }
        const mobileFile = files?.mobileImage?.[0];
        if (mobileFile) {
            if (banner.mobileImageUrl) {
                await this.s3Service.deleteByUrl(banner.mobileImageUrl).catch(() => { });
            }
            updateData.mobileImageUrl = await this.s3Service.uploadBuffer(mobileFile.buffer, 'banners/mobile', mobileFile.originalname, mobileFile.mimetype);
        }
        if (dto.startDate)
            updateData.startDate = new Date(dto.startDate);
        if (dto.endDate)
            updateData.endDate = new Date(dto.endDate);
        const updated = await this.bannersRepo.update(id, updateData);
        return updated;
    }
    async deleteBanner(id) {
        const banner = await this.bannersRepo.findById(id);
        if (!banner)
            throw new common_1.NotFoundException(`Banner '${id}' not found`);
        if (banner.imageUrl) {
            await this.s3Service.deleteByUrl(banner.imageUrl).catch(() => { });
        }
        if (banner.mobileImageUrl) {
            await this.s3Service.deleteByUrl(banner.mobileImageUrl).catch(() => { });
        }
        await this.bannersRepo.softDelete(id);
        return { message: 'Banner deleted successfully' };
    }
    async toggleActive(id) {
        const banner = await this.bannersRepo.findById(id);
        if (!banner)
            throw new common_1.NotFoundException(`Banner '${id}' not found`);
        const updated = await this.bannersRepo.update(id, { isActive: !banner.isActive });
        return updated;
    }
    async reorder(bannerOrders) {
        await Promise.all(bannerOrders.map(({ id, displayOrder }) => this.bannersRepo.update(id, { displayOrder })));
        return { message: `Reordered ${bannerOrders.length} banners` };
    }
};
exports.BannersService = BannersService;
exports.BannersService = BannersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [banners_repository_js_1.BannersRepository,
        s3_service_js_1.S3Service])
], BannersService);
//# sourceMappingURL=banners.service.js.map