import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BannersRepository } from './repositories/banners.repository.js';
import { S3Service } from '../s3/s3.service.js';
import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';
import { QueryBannerDto } from './dto/query-banner.dto.js';
import { BannerDocument } from './schemas/banner.schema.js';

@Injectable()
export class BannersService {
  constructor(
    private readonly bannersRepo: BannersRepository,
    private readonly s3Service: S3Service,
  ) {}

  // ─── PUBLIC ───────────────────────────────────────────────────────────────

  async getActiveBanners(query: QueryBannerDto): Promise<BannerDocument[]> {
    return this.bannersRepo.findActive(query);
  }

  async getBannerById(id: string): Promise<BannerDocument> {
    const banner = await this.bannersRepo.findById(id);
    if (!banner) throw new NotFoundException(`Banner '${id}' not found`);
    return banner;
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  async getAllBanners(query: QueryBannerDto): Promise<BannerDocument[]> {
    return this.bannersRepo.findAll(query);
  }

  async createBanner(
    dto: CreateBannerDto,
    files: {
      image?: Express.Multer.File[];
      mobileImage?: Express.Multer.File[];
    },
  ): Promise<BannerDocument> {
    const imageFile = files?.image?.[0];
    if (!imageFile) {
      throw new BadRequestException('Banner image is required');
    }

    // Upload desktop image to S3
    const imageUrl = await this.s3Service.uploadBuffer(
      imageFile.buffer,
      'banners',
      imageFile.originalname,
      imageFile.mimetype,
    );

    // Upload optional mobile image to S3
    let mobileImageUrl: string | undefined;
    const mobileFile = files?.mobileImage?.[0];
    if (mobileFile) {
      mobileImageUrl = await this.s3Service.uploadBuffer(
        mobileFile.buffer,
        'banners/mobile',
        mobileFile.originalname,
        mobileFile.mimetype,
      );
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

  async updateBanner(
    id: string,
    dto: UpdateBannerDto,
    files?: {
      image?: Express.Multer.File[];
      mobileImage?: Express.Multer.File[];
    },
  ): Promise<BannerDocument> {
    const banner = await this.bannersRepo.findById(id);
    if (!banner) throw new NotFoundException(`Banner '${id}' not found`);

    const updateData: Record<string, any> = { ...dto };

    // Upload new desktop image if provided
    const imageFile = files?.image?.[0];
    if (imageFile) {
      // Delete old image from S3
      if (banner.imageUrl) {
        await this.s3Service.deleteByUrl(banner.imageUrl).catch(() => {});
      }
      updateData.imageUrl = await this.s3Service.uploadBuffer(
        imageFile.buffer,
        'banners',
        imageFile.originalname,
        imageFile.mimetype,
      );
    }

    // Upload new mobile image if provided
    const mobileFile = files?.mobileImage?.[0];
    if (mobileFile) {
      if (banner.mobileImageUrl) {
        await this.s3Service.deleteByUrl(banner.mobileImageUrl).catch(() => {});
      }
      updateData.mobileImageUrl = await this.s3Service.uploadBuffer(
        mobileFile.buffer,
        'banners/mobile',
        mobileFile.originalname,
        mobileFile.mimetype,
      );
    }

    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    const updated = await this.bannersRepo.update(id, updateData);
    return updated!;
  }

  async deleteBanner(id: string): Promise<{ message: string }> {
    const banner = await this.bannersRepo.findById(id);
    if (!banner) throw new NotFoundException(`Banner '${id}' not found`);

    // Delete images from S3
    if (banner.imageUrl) {
      await this.s3Service.deleteByUrl(banner.imageUrl).catch(() => {});
    }
    if (banner.mobileImageUrl) {
      await this.s3Service.deleteByUrl(banner.mobileImageUrl).catch(() => {});
    }

    await this.bannersRepo.softDelete(id);
    return { message: 'Banner deleted successfully' };
  }

  async toggleActive(id: string): Promise<BannerDocument> {
    const banner = await this.bannersRepo.findById(id);
    if (!banner) throw new NotFoundException(`Banner '${id}' not found`);

    const updated = await this.bannersRepo.update(id, { isActive: !banner.isActive });
    return updated!;
  }

  async reorder(bannerOrders: Array<{ id: string; displayOrder: number }>): Promise<{ message: string }> {
    await Promise.all(
      bannerOrders.map(({ id, displayOrder }) =>
        this.bannersRepo.update(id, { displayOrder }),
      ),
    );
    return { message: `Reordered ${bannerOrders.length} banners` };
  }
}
