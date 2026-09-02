import { Model, UpdateQuery } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema.js';
import { ProductVariant } from '../schemas/product-variant.schema.js';
import { QueryProductDto } from '../dto/query-product.dto.js';
export declare class ProductsRepository {
    private readonly productModel;
    constructor(productModel: Model<ProductDocument>);
    create(data: Partial<Product>): Promise<ProductDocument>;
    findById(id: string): Promise<ProductDocument | null>;
    findBySlug(slug: string): Promise<ProductDocument | null>;
    findAll(queryDto: QueryProductDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: string, updateData: UpdateQuery<ProductDocument>): Promise<ProductDocument | null>;
    softDelete(id: string): Promise<ProductDocument | null>;
    addImages(id: string, urls: string[]): Promise<ProductDocument | null>;
    addVariant(id: string, variant: Partial<ProductVariant>): Promise<ProductDocument | null>;
    updateVariant(productId: string, variantId: string, updateData: Partial<ProductVariant>): Promise<ProductDocument | null>;
    deleteVariant(productId: string, variantId: string): Promise<ProductDocument | null>;
    decrementVariantStock(productIdStr?: string, variantIdStr?: string, skuStr?: string, quantity?: number): Promise<void>;
    incrementVariantStock(productIdStr?: string, variantIdStr?: string, skuStr?: string, quantity?: number): Promise<void>;
}
