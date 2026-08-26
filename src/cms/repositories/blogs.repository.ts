import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema.js';
import { QueryBlogDto } from '../dto/query-blog.dto.js';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  async create(data: Partial<Blog>): Promise<BlogDocument> {
    const blog = new this.blogModel(data);
    return blog.save();
  }

  async findById(id: string): Promise<BlogDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.blogModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).exec();
  }

  async findBySlug(slug: string): Promise<BlogDocument | null> {
    return this.blogModel.findOne({ slug, isDeleted: false }).exec();
  }

  async findPublished(
    query: QueryBlogDto,
  ): Promise<{ data: BlogDocument[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, category, search, tag } = query;
    const filter: Record<string, any> = {
      isPublished: true,
      isDeleted: false,
    };

    if (category) {
      filter.category = category;
    }
    if (tag) {
      filter.tags = tag;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { summary: regex }, { tags: regex }];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.blogModel.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).exec(),
      this.blogModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.blogModel.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).exec();
  }

  async update(id: string, updateData: Partial<Blog>): Promise<BlogDocument | null> {
    return this.blogModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<BlogDocument | null> {
    return this.blogModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
      .exec();
  }
}
