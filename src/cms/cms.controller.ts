import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CmsService } from './cms.service.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';
import { CreateFaqDto } from './dto/create-faq.dto.js';
import { UpdateFaqDto } from './dto/update-faq.dto.js';
import { CreateBlogDto } from './dto/create-blog.dto.js';
import { UpdateBlogDto } from './dto/update-blog.dto.js';
import { QueryBlogDto } from './dto/query-blog.dto.js';

@ApiTags('CMS & Content')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ─── PUBLIC PAGES ─────────────────────────────────────────────────────────

  @Get('pages')
  @ApiOperation({ summary: 'List all published static pages (About, Privacy, Terms, Refund, Shipping)' })
  @ApiResponse({ status: 200, description: 'List of published pages returned' })
  async getPages() {
    return this.cmsService.getPages();
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get static page by slug (e.g. about-us, privacy-policy, terms-and-conditions, refund-policy, shipping-policy)' })
  @ApiParam({ name: 'slug', example: 'about-us' })
  @ApiResponse({ status: 200, description: 'Page details returned' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async getPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.getPageBySlug(slug);
  }

  // ─── PUBLIC FAQS ──────────────────────────────────────────────────────────

  @Get('faqs')
  @ApiOperation({ summary: 'Get active FAQs grouped by category (General, Orders, Shipping, Returns, Payment)' })
  @ApiResponse({ status: 200, description: 'Categorized FAQs returned' })
  async getFaqs() {
    return this.cmsService.getFaqs();
  }

  // ─── PUBLIC BLOGS ─────────────────────────────────────────────────────────

  @Get('blogs')
  @ApiOperation({ summary: 'List published blog posts (supports search and category filter)' })
  @ApiResponse({ status: 200, description: 'Paginated blog posts returned' })
  async getBlogs(@Query() query: QueryBlogDto) {
    return this.cmsService.getBlogs(query);
  }

  @Get('blogs/:slug')
  @ApiOperation({ summary: 'Get blog post details by slug (increments view count)' })
  @ApiParam({ name: 'slug', example: 'top-5-festive-silk-sarees-weddings' })
  @ApiResponse({ status: 200, description: 'Blog post details returned' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async getBlogBySlug(@Param('slug') slug: string) {
    return this.cmsService.getBlogBySlug(slug);
  }

  // ─── ADMIN PAGES ──────────────────────────────────────────────────────────

  @Post('admin/pages')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Create new static content page' })
  @ApiResponse({ status: 201, description: 'Page created successfully' })
  async createPage(@Body() dto: CreatePageDto) {
    return this.cmsService.createPage(dto);
  }

  @Put('admin/pages/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Update static content page' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Page updated successfully' })
  async updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.cmsService.updatePage(id, dto);
  }

  @Delete('admin/pages/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Delete static content page' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Page deleted successfully' })
  async deletePage(@Param('id') id: string) {
    return this.cmsService.deletePage(id);
  }

  // ─── ADMIN FAQS ───────────────────────────────────────────────────────────

  @Get('admin/faqs')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get all FAQ entries' })
  @ApiResponse({ status: 200, description: 'All FAQs returned' })
  async getFaqsAdmin() {
    return this.cmsService.getFaqsAdmin();
  }

  @Post('admin/faqs')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Create new FAQ entry' })
  @ApiResponse({ status: 201, description: 'FAQ created successfully' })
  async createFaq(@Body() dto: CreateFaqDto) {
    return this.cmsService.createFaq(dto);
  }

  @Put('admin/faqs/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Update FAQ entry' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'FAQ updated successfully' })
  async updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.cmsService.updateFaq(id, dto);
  }

  @Delete('admin/faqs/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Delete FAQ entry' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'FAQ deleted successfully' })
  async deleteFaq(@Param('id') id: string) {
    return this.cmsService.deleteFaq(id);
  }

  // ─── ADMIN BLOGS ──────────────────────────────────────────────────────────

  @Post('admin/blogs')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Publish a new blog post' })
  @ApiResponse({ status: 201, description: 'Blog post published successfully' })
  async createBlog(@Body() dto: CreateBlogDto) {
    return this.cmsService.createBlog(dto);
  }

  @Put('admin/blogs/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Update blog post' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Blog post updated successfully' })
  async updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.cmsService.updateBlog(id, dto);
  }

  @Delete('admin/blogs/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Delete blog post' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Blog post deleted successfully' })
  async deleteBlog(@Param('id') id: string) {
    return this.cmsService.deleteBlog(id);
  }
}
