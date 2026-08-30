import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { Types } from 'mongoose';
import { CategoriesRepository } from './repositories/categories.repository.js';
import { RedisCacheService } from '../cache/cache.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { CategoryDocument } from './schemas/category.schema.js';

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    @Optional() private readonly cacheService?: RedisCacheService,
  ) {}

  async create(
    createDto: CreateCategoryDto,
    imagePath?: string,
    bannerPath?: string,
  ): Promise<CategoryDocument> {
    const { name, slug: providedSlug, parentId, description, displayOrder, status, seoTitle, seoDescription, seoKeywords } = createDto;
    const slug = generateSlug(providedSlug || name);

    // Check duplicate slug
    const existing = await this.categoriesRepository.findBySlug(slug);
    if (existing) {
      throw new BadRequestException('Category slug already exists');
    }

    let ancestors: any[] = [];
    let parentObjectId: Types.ObjectId | null = null;

    if (parentId && parentId !== 'null' && String(parentId).trim() !== '') {
      const parent = await this.categoriesRepository.findById(parentId);
      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${parentId} not found`);
      }
      parentObjectId = parent._id as Types.ObjectId;
      ancestors = [
        ...parent.ancestors,
        { _id: parent._id, name: parent.name, slug: parent.slug },
      ];
    }

    const created = await this.categoriesRepository.create({
      name,
      slug,
      parentId: parentObjectId,
      ancestors,
      description: description || '',
      displayOrder: displayOrder ?? 0,
      status: status !== undefined ? status : true,
      image: imagePath || '',
      banner: bannerPath || '',
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      seoKeywords: seoKeywords || [],
    });

    if (this.cacheService) {
      await this.cacheService.reset();
    }

    return created;
  }

  async getCategoryTree() {
    const roots = await this.categoriesRepository.findRootCategories();
    const allSubs = await this.categoriesRepository.findAllSubCategories();

    const tree = roots.map((root) => {
      const rootIdStr = root._id.toString();
      const children = allSubs.filter((sub) => {
        const pId = typeof sub.parentId === 'object' && sub.parentId ? ((sub.parentId as any)._id || (sub.parentId as any).id) : sub.parentId;
        return String(pId) === rootIdStr;
      });
      return {
        ...root.toObject(),
        subCategories: children,
      };
    });

    return tree;
  }

  async findOne(idOrSlug: string): Promise<CategoryDocument> {
    const category = await this.categoriesRepository.findByIdOrSlug(idOrSlug);
    if (!category) {
      throw new NotFoundException(`Category with identifier '${idOrSlug}' not found`);
    }
    return category;
  }

  async findByIdOrSlug(idOrSlug: string): Promise<CategoryDocument> {
    return this.findOne(idOrSlug);
  }

  async findById(id: string): Promise<CategoryDocument> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoriesRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }
    return category;
  }

  async findAll(queryDto: QueryCategoryDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 500;

    const { data, total } = await this.categoriesRepository.findAll(queryDto);
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async update(
    id: string,
    updateDto: UpdateCategoryDto,
    imagePath?: string,
    bannerPath?: string,
  ): Promise<CategoryDocument> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const { name, slug: providedSlug, parentId, description, displayOrder, seoTitle, seoDescription, seoKeywords, status } = updateDto;
    const updateData: Record<string, any> = {};

    if (description !== undefined) updateData.description = description;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;
    if (status !== undefined) updateData.status = status;
    if (imagePath) updateData.image = imagePath;
    if (bannerPath) updateData.banner = bannerPath;

    let nameChanged = false;
    let parentChanged = false;

    if ((name && name !== category.name) || (providedSlug && providedSlug !== category.slug)) {
      const newSlug = generateSlug(providedSlug || name || category.name);
      const existing = await this.categoriesRepository.findBySlug(newSlug);
      if (existing && existing._id.toString() !== id) {
        throw new BadRequestException('Category slug already exists');
      }
      if (name) updateData.name = name;
      updateData.slug = newSlug;
      nameChanged = true;
    }

    if (parentId !== undefined && String(parentId) !== String(category.parentId)) {
      parentChanged = true;
      if (parentId === null || parentId === 'null' || String(parentId).trim() === '') {
        updateData.parentId = null;
        updateData.ancestors = [];
      } else {
        if (parentId === id) {
          throw new BadRequestException('A category cannot be its own parent');
        }

        const targetParent = await this.categoriesRepository.findById(parentId);
        if (!targetParent) {
          throw new NotFoundException(`Parent category with ID ${parentId} not found`);
        }

        const isDescendant = targetParent.ancestors.some(
          (anc) => anc._id.toString() === id,
        );
        if (isDescendant) {
          throw new BadRequestException('Cycle detected: Parent category cannot be a descendant of the target category');
        }

        updateData.parentId = new Types.ObjectId(parentId);
        updateData.ancestors = [
          ...targetParent.ancestors,
          { _id: targetParent._id, name: targetParent.name, slug: targetParent.slug },
        ];
      }
    }

    const updatedCategory = await this.categoriesRepository.update(id, { $set: updateData });
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (nameChanged || parentChanged) {
      await this.updateDescendantsAncestors(
        id,
        updatedCategory.ancestors,
        updatedCategory.name,
        updatedCategory.slug,
      );
    }

    if (this.cacheService) {
      await this.cacheService.reset();
    }

    return updatedCategory;
  }

  async softDelete(id: string): Promise<void> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    await this.categoriesRepository.softDelete(id);
    await this.categoriesRepository.softDeleteDescendants(id);

    if (this.cacheService) {
      await this.cacheService.reset();
    }
  }

  async delete(id: string): Promise<void> {
    return this.softDelete(id);
  }

  async toggleActive(id: string): Promise<CategoryDocument> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const updated = await this.categoriesRepository.update(id, {
      $set: { status: !category.status },
    });

    if (!updated) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (this.cacheService) {
      await this.cacheService.reset();
    }

    return updated;
  }

  private async updateDescendantsAncestors(
    parentId: string,
    parentAncestors: any[],
    parentName: string,
    parentSlug: string,
  ): Promise<void> {
    const children = await this.categoriesRepository.findDirectChildren(parentId);
    const parentNode = { _id: new Types.ObjectId(parentId), name: parentName, slug: parentSlug };
    const childAncestors = [...parentAncestors, parentNode];

    for (const child of children) {
      await this.categoriesRepository.update(child._id.toString(), {
        $set: { ancestors: childAncestors },
      });
      await this.updateDescendantsAncestors(
        child._id.toString(),
        childAncestors,
        child.name,
        child.slug,
      );
    }
  }
}
