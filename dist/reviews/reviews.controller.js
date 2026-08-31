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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reviews_service_js_1 = require("./reviews.service.js");
const create_review_dto_js_1 = require("./dto/create-review.dto.js");
const update_review_dto_js_1 = require("./dto/update-review.dto.js");
const query_review_dto_js_1 = require("./dto/query-review.dto.js");
const moderate_review_dto_js_1 = require("./dto/moderate-review.dto.js");
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async createReview(dto, req) {
        const userId = req.user?.id || req.user?._id;
        return this.reviewsService.createReview(userId, dto);
    }
    async getProductReviews(productId, query) {
        return this.reviewsService.getProductReviews(productId, query);
    }
    async getMyReviews(req) {
        const userId = req.user?.id || req.user?._id;
        return this.reviewsService.getMyReviews(userId);
    }
    async updateReview(reviewId, dto, req) {
        const userId = req.user?.id || req.user?._id;
        return this.reviewsService.updateReview(reviewId, userId, dto);
    }
    async deleteReview(reviewId, req) {
        const userId = req.user?.id || req.user?._id;
        const isAdmin = req.user?.role === 'ADMIN';
        return this.reviewsService.deleteReview(reviewId, userId, isAdmin);
    }
    async toggleHelpfulVote(reviewId, req) {
        const userId = req.user?.id || req.user?._id;
        return this.reviewsService.toggleHelpfulVote(reviewId, userId);
    }
    async getAllReviewsAdminAll(query) {
        return this.reviewsService.getAllReviews(query);
    }
    async getAllReviewsAdmin(query) {
        return this.reviewsService.getAllReviews(query);
    }
    async moderateReview(reviewId, dto) {
        return this.reviewsService.moderateReview(reviewId, dto);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a product review with rating, text, images, and videos' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Review submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User already submitted a review or invalid payload' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_review_dto_js_1.CreateReviewDto, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get approved reviews and rating breakdown for a product' }),
    (0, swagger_1.ApiParam)({ name: 'productId', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reviews and rating summary returned' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_review_dto_js_1.QueryReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getProductReviews", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reviews submitted by the current authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of user reviews returned' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getMyReviews", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update your own review' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a002' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Cannot update another user review' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_review_dto_js_1.UpdateReviewDto, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "updateReview", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete your own review or admin deletion' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a002' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "deleteReview", null);
__decorate([
    (0, common_1.Post)(':id/vote-helpful'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle helpful upvote on a review' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a002' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Helpful vote toggled' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "toggleHelpfulVote", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get all reviews with status filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All reviews returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_review_dto_js_1.QueryReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getAllReviewsAdminAll", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get all reviews with status filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All reviews returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_review_dto_js_1.QueryReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getAllReviewsAdmin", null);
__decorate([
    (0, common_1.Patch)('admin/:id/moderate'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Approve or reject review and add official response' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a002' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review moderation completed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, moderate_review_dto_js_1.ModerateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "moderateReview", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, swagger_1.ApiTags)('Reviews'),
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [reviews_service_js_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map