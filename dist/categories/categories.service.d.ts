import { CategoriesRepository } from './repositories/categories.repository.js';
import { RedisCacheService } from '../cache/cache.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { CategoryDocument } from './schemas/category.schema.js';
export declare class CategoriesService {
    private readonly categoriesRepository;
    private readonly cacheService?;
    constructor(categoriesRepository: CategoriesRepository, cacheService?: RedisCacheService | undefined);
    create(createDto: CreateCategoryDto, imagePath?: string, bannerPath?: string): Promise<CategoryDocument>;
    update(id: string, updateDto: UpdateCategoryDto, imagePath?: string, bannerPath?: string): Promise<CategoryDocument>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<CategoryDocument>;
    findBySlug(slug: string): Promise<CategoryDocument>;
    findByIdOrSlug(idOrSlug: string): Promise<CategoryDocument>;
    findAll(queryDto: QueryCategoryDto): Promise<any>;
    private updateDescendantsAncestors;
}
