import { ProductsRepository } from './repositories/products.repository.js';
import { S3Service } from '../s3/s3.service.js';
import { RedisCacheService } from '../cache/cache.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CreateVariantDto } from './dto/create-variant.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { ProductDocument } from './schemas/product.schema.js';
export declare class ProductsService {
    private readonly productsRepository;
    private readonly s3Service;
    private readonly cacheService?;
    constructor(productsRepository: ProductsRepository, s3Service: S3Service, cacheService?: RedisCacheService | undefined);
    create(createDto: CreateProductDto): Promise<ProductDocument>;
    uploadImages(productId: string, files: Express.Multer.File[], folder: 'products' | `products/${string}`): Promise<ProductDocument>;
    update(id: string, updateDto: UpdateProductDto): Promise<ProductDocument>;
    delete(id: string): Promise<void>;
    findByIdOrSlug(idOrSlug: string): Promise<ProductDocument>;
    findAll(queryDto: QueryProductDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    addVariant(productId: string, variantDto: CreateVariantDto): Promise<ProductDocument>;
    updateVariant(productId: string, variantId: string, variantDto: Partial<CreateVariantDto>): Promise<ProductDocument>;
    deleteVariant(productId: string, variantId: string): Promise<ProductDocument>;
    uploadVariantImages(productId: string, variantId: string, files: Express.Multer.File[]): Promise<ProductDocument>;
}
