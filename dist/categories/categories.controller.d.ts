import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createDto: CreateCategoryDto, files: {
        image?: Express.Multer.File[];
        banner?: Express.Multer.File[];
    }): Promise<import("./schemas/category.schema.js").CategoryDocument>;
    findAll(queryDto: QueryCategoryDto): Promise<{
        data: import("./schemas/category.schema.js").CategoryDocument[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCategoryTree(): Promise<any[]>;
    findOne(idOrSlug: string): Promise<import("./schemas/category.schema.js").CategoryDocument>;
    update(id: string, updateDto: UpdateCategoryDto, files: {
        image?: Express.Multer.File[];
        banner?: Express.Multer.File[];
    }): Promise<import("./schemas/category.schema.js").CategoryDocument>;
    remove(id: string): Promise<void>;
    toggleActive(id: string): Promise<import("./schemas/category.schema.js").CategoryDocument>;
}
