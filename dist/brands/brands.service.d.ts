import { BrandsRepository } from './repositories/brands.repository.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { QueryBrandDto } from './dto/query-brand.dto.js';
import { BrandDocument } from './schemas/brand.schema.js';
export declare class BrandsService {
    private readonly brandsRepository;
    constructor(brandsRepository: BrandsRepository);
    create(createDto: CreateBrandDto, logoPath?: string): Promise<BrandDocument>;
    update(id: string, updateDto: UpdateBrandDto, logoPath?: string): Promise<BrandDocument>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<BrandDocument>;
    findBySlug(slug: string): Promise<BrandDocument>;
    findByIdOrSlug(idOrSlug: string): Promise<BrandDocument>;
    findAll(queryDto: QueryBrandDto): Promise<{
        data: BrandDocument[];
        total: number;
    }>;
}
