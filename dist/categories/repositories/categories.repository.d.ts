import { Model, UpdateQuery } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema.js';
import { QueryCategoryDto } from '../dto/query-category.dto.js';
export declare class CategoriesRepository {
    private readonly categoryModel;
    constructor(categoryModel: Model<CategoryDocument>);
    create(categoryData: Partial<Category>): Promise<CategoryDocument>;
    findById(id: string): Promise<CategoryDocument | null>;
    findBySlug(slug: string): Promise<CategoryDocument | null>;
    findByIdOrSlug(idOrSlug: string): Promise<CategoryDocument | null>;
    findAll(queryDto: QueryCategoryDto): Promise<{
        data: CategoryDocument[];
        total: number;
    }>;
    update(id: string, updateData: UpdateQuery<CategoryDocument>): Promise<CategoryDocument | null>;
    softDelete(id: string): Promise<CategoryDocument | null>;
    findDirectChildren(parentId: string): Promise<CategoryDocument[]>;
    findDescendants(categoryId: string): Promise<CategoryDocument[]>;
    softDeleteDescendants(categoryId: string): Promise<void>;
    findRootCategories(): Promise<CategoryDocument[]>;
    findAllSubCategories(): Promise<CategoryDocument[]>;
}
