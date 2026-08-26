import { Model, UpdateQuery } from 'mongoose';
import { Brand, BrandDocument } from '../schemas/brand.schema.js';
import { QueryBrandDto } from '../dto/query-brand.dto.js';
export declare class BrandsRepository {
    private readonly brandModel;
    constructor(brandModel: Model<BrandDocument>);
    create(brandData: Partial<Brand>): Promise<BrandDocument>;
    findById(id: string): Promise<BrandDocument | null>;
    findBySlug(slug: string): Promise<BrandDocument | null>;
    findByIdOrSlug(idOrSlug: string): Promise<BrandDocument | null>;
    findAll(queryDto: QueryBrandDto): Promise<{
        data: BrandDocument[];
        total: number;
    }>;
    update(id: string, updateData: UpdateQuery<BrandDocument>): Promise<BrandDocument | null>;
    softDelete(id: string): Promise<BrandDocument | null>;
}
