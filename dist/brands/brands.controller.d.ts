import { BrandsService } from './brands.service.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { QueryBrandDto } from './dto/query-brand.dto.js';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
    create(createDto: CreateBrandDto, logoFile?: Express.Multer.File): Promise<import("./schemas/brand.schema.js").BrandDocument>;
    findAll(queryDto: QueryBrandDto): Promise<{
        data: import("./schemas/brand.schema.js").BrandDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(idOrSlug: string): Promise<import("./schemas/brand.schema.js").BrandDocument>;
    update(id: string, updateDto: UpdateBrandDto, logoFile?: Express.Multer.File): Promise<import("./schemas/brand.schema.js").BrandDocument>;
    remove(id: string): Promise<void>;
}
