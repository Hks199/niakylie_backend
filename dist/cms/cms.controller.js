"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cms_service_js_1 = require("./cms.service.js");
const create_page_dto_js_1 = require("./dto/create-page.dto.js");
const update_page_dto_js_1 = require("./dto/update-page.dto.js");
const create_faq_dto_js_1 = require("./dto/create-faq.dto.js");
const update_faq_dto_js_1 = require("./dto/update-faq.dto.js");
const create_blog_dto_js_1 = require("./dto/create-blog.dto.js");
const update_blog_dto_js_1 = require("./dto/update-blog.dto.js");
const query_blog_dto_js_1 = require("./dto/query-blog.dto.js");
const subscribe_newsletter_dto_js_1 = require("./dto/subscribe-newsletter.dto.js");
let CmsController = class CmsController {
    cmsService;
    constructor(cmsService) {
        this.cmsService = cmsService;
    }
    async getPages() {
        return this.cmsService.getPages();
    }
    async getPageBySlug(slug) {
        return this.cmsService.getPageBySlug(slug);
    }
    async getFaqs() {
        return this.cmsService.getFaqs();
    }
    async getBlogs(query) {
        return this.cmsService.getBlogs(query);
    }
    async getBlogBySlug(slug) {
        return this.cmsService.getBlogBySlug(slug);
    }
    async createPage(dto) {
        return this.cmsService.createPage(dto);
    }
    async updatePage(id, dto) {
        return this.cmsService.updatePage(id, dto);
    }
    async deletePage(id) {
        return this.cmsService.deletePage(id);
    }
    async getFaqsAdmin() {
        return this.cmsService.getFaqsAdmin();
    }
    async createFaq(dto) {
        return this.cmsService.createFaq(dto);
    }
    async updateFaq(id, dto) {
        return this.cmsService.updateFaq(id, dto);
    }
    async deleteFaq(id) {
        return this.cmsService.deleteFaq(id);
    }
    async createBlog(dto) {
        return this.cmsService.createBlog(dto);
    }
    async updateBlog(id, dto) {
        return this.cmsService.updateBlog(id, dto);
    }
    async deleteBlog(id) {
        return this.cmsService.deleteBlog(id);
    }
    async subscribe(dto) {
        return this.cmsService.subscribeNewsletter(dto);
    }
    async getSubscribers(query) {
        return this.cmsService.getSubscribers(query);
    }
    async deleteSubscriber(id) {
        return this.cmsService.deleteSubscriber(id);
    }
};
exports.CmsController = CmsController;
__decorate([
    (0, common_1.Get)('pages'),
    (0, swagger_1.ApiOperation)({ summary: 'List all published static pages (About, Privacy, Terms, Refund, Shipping)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of published pages returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getPages", null);
__decorate([
    (0, common_1.Get)('pages/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get static page by slug (e.g. about-us, privacy-policy, terms-and-conditions, refund-policy, shipping-policy)' }),
    (0, swagger_1.ApiParam)({ name: 'slug', example: 'about-us' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Page not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getPageBySlug", null);
__decorate([
    (0, common_1.Get)('faqs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active FAQs grouped by category (General, Orders, Shipping, Returns, Payment)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categorized FAQs returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getFaqs", null);
__decorate([
    (0, common_1.Get)('blogs'),
    (0, swagger_1.ApiOperation)({ summary: 'List published blog posts (supports search and category filter)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated blog posts returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_blog_dto_js_1.QueryBlogDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getBlogs", null);
__decorate([
    (0, common_1.Get)('blogs/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get blog post details by slug (increments view count)' }),
    (0, swagger_1.ApiParam)({ name: 'slug', example: 'top-5-festive-silk-sarees-weddings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Blog post details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Blog post not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getBlogBySlug", null);
__decorate([
    (0, common_1.Post)('admin/pages'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Create new static content page' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Page created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_dto_js_1.CreatePageDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "createPage", null);
__decorate([
    (0, common_1.Put)('admin/pages/:id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Update static content page' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_page_dto_js_1.UpdatePageDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "updatePage", null);
__decorate([
    (0, common_1.Delete)('admin/pages/:id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Delete static content page' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "deletePage", null);
__decorate([
    (0, common_1.Get)('admin/faqs'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get all FAQ entries' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All FAQs returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getFaqsAdmin", null);
__decorate([
    (0, common_1.Post)('admin/faqs'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Create new FAQ entry' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'FAQ created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_faq_dto_js_1.CreateFaqDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "createFaq", null);
__decorate([
    (0, common_1.Put)('admin/faqs/:id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Update FAQ entry' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'FAQ updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_faq_dto_js_1.UpdateFaqDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "updateFaq", null);
__decorate([
    (0, common_1.Delete)('admin/faqs/:id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Delete FAQ entry' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'FAQ deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "deleteFaq", null);
__decorate([
    (0, common_1.Post)('admin/blogs'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Publish a new blog post' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Blog post published successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_blog_dto_js_1.CreateBlogDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "createBlog", null);
__decorate([
    (0, common_1.Put)('admin/blogs/:id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Update blog post' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Blog post updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_blog_dto_js_1.UpdateBlogDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "updateBlog", null);
__decorate([
    (0, common_1.Delete)('admin/blogs/:id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Delete blog post' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Blog post deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "deleteBlog", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe to newsletter and exclusive offers via Email and/or Mobile Number' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully subscribed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid email or mobile number provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscribe_newsletter_dto_js_1.SubscribeNewsletterDto]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Get)('admin/subscribers'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get list of collected subscriber emails and mobile numbers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of subscribers returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getSubscribers", null);
__decorate([
    (0, common_1.Delete)('admin/subscribers/:id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Delete subscriber entry' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscriber entry deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "deleteSubscriber", null);
exports.CmsController = CmsController = __decorate([
    (0, swagger_1.ApiTags)('CMS & Content'),
    (0, common_1.Controller)('cms'),
    __metadata("design:paramtypes", [cms_service_js_1.CmsService])
], CmsController);
//# sourceMappingURL=cms.controller.js.map