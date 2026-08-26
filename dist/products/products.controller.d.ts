import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CreateVariantDto } from './dto/create-variant.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createDto: CreateProductDto): Promise<import("./schemas/product.schema.js").ProductDocument>;
    findAll(queryDto: QueryProductDto): Promise<any>;
    findOne(idOrSlug: string): Promise<import("./schemas/product.schema.js").ProductDocument>;
    update(id: string, updateDto: UpdateProductDto): Promise<import("./schemas/product.schema.js").ProductDocument>;
    remove(id: string): Promise<void>;
    uploadImages(id: string, files: Express.Multer.File[]): Promise<import("./schemas/product.schema.js").ProductDocument>;
    addVariant(id: string, variantDto: CreateVariantDto): Promise<import("./schemas/product.schema.js").ProductDocument>;
    updateVariant(id: string, variantId: string, variantDto: Partial<CreateVariantDto>): Promise<import("./schemas/product.schema.js").ProductDocument>;
    deleteVariant(id: string, variantId: string): Promise<import("./schemas/product.schema.js").ProductDocument>;
    uploadVariantImages(id: string, variantId: string, files: Express.Multer.File[]): Promise<import("./schemas/product.schema.js").ProductDocument>;
}
