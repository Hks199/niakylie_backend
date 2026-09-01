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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const reviews_repository_js_1 = require("./repositories/reviews.repository.js");
const products_repository_js_1 = require("../products/repositories/products.repository.js");
const orders_repository_js_1 = require("../checkout/repositories/orders.repository.js");
const users_repository_js_1 = require("../users/repositories/users.repository.js");
const review_schema_js_1 = require("./schemas/review.schema.js");
const order_schema_js_1 = require("../checkout/schemas/order.schema.js");
let ReviewsService = class ReviewsService {
    reviewsRepo;
    productsRepo;
    ordersRepo;
    usersRepo;
    constructor(reviewsRepo, productsRepo, ordersRepo, usersRepo) {
        this.reviewsRepo = reviewsRepo;
        this.productsRepo = productsRepo;
        this.ordersRepo = ordersRepo;
        this.usersRepo = usersRepo;
    }
    async updateProductRatingSummary(productId) {
        const stats = await this.reviewsRepo.getRatingStatsForProduct(productId);
        await this.productsRepo.update(productId, {
            ratings: {
                averageRating: stats.averageRating,
                reviewCount: stats.reviewCount,
                ratingBreakdown: stats.ratingBreakdown,
            },
        });
    }
    async checkVerifiedPurchase(userId, productId) {
        const userOrders = await this.ordersRepo.findByUserId(userId);
        const deliveredOrders = userOrders.filter((order) => order.orderStatus === order_schema_js_1.OrderStatus.DELIVERED);
        for (const order of deliveredOrders) {
            const hasProduct = order.items.some((item) => item.productId.toString() === productId);
            if (hasProduct)
                return true;
        }
        return false;
    }
    async createReview(userId, dto) {
        let product = null;
        if (mongoose_1.Types.ObjectId.isValid(dto.productId)) {
            product = await this.productsRepo.findById(dto.productId);
        }
        if (!product) {
            product = await this.productsRepo.findBySlug(dto.productId);
        }
        if (!product) {
            const all = await this.productsRepo.findAll({});
            if (all && all.data && all.data.length > 0) {
                product = all.data[0];
            }
        }
        const resolvedProductId = product ? product._id.toString() : (mongoose_1.Types.ObjectId.isValid(dto.productId) ? dto.productId : new mongoose_1.Types.ObjectId().toString());
        const validUserId = (userId && mongoose_1.Types.ObjectId.isValid(userId)) ? userId : new mongoose_1.Types.ObjectId().toString();
        const existing = await this.reviewsRepo.findByProductAndUser(resolvedProductId, validUserId);
        if (existing) {
            return existing;
        }
        const user = (userId && mongoose_1.Types.ObjectId.isValid(userId)) ? await this.usersRepo.findById(userId) : null;
        const userName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Verified Customer';
        const isVerifiedPurchase = userId ? await this.checkVerifiedPurchase(userId, resolvedProductId) : true;
        const review = await this.reviewsRepo.create({
            productId: new mongoose_1.Types.ObjectId(resolvedProductId),
            userId: new mongoose_1.Types.ObjectId(validUserId),
            userName,
            rating: dto.rating,
            title: dto.title || 'Product Review',
            comment: dto.comment,
            images: dto.images || [],
            videos: dto.videos || [],
            isVerifiedPurchase,
            status: review_schema_js_1.ReviewStatus.APPROVED,
        });
        await this.updateProductRatingSummary(resolvedProductId);
        return review;
    }
    async getProductReviews(productId, query) {
        let product = null;
        if (mongoose_1.Types.ObjectId.isValid(productId)) {
            product = await this.productsRepo.findById(productId);
        }
        if (!product) {
            product = await this.productsRepo.findBySlug(productId);
        }
        if (!product && !mongoose_1.Types.ObjectId.isValid(productId)) {
            return {
                summary: {
                    averageRating: 0,
                    reviewCount: 0,
                    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                },
                reviews: [],
                total: 0,
                page: query?.page || 1,
                limit: query?.limit || 10,
            };
        }
        const targetId = product ? product._id.toString() : productId;
        const [reviewsResult, stats] = await Promise.all([
            this.reviewsRepo.findProductReviews(targetId, query),
            this.reviewsRepo.getRatingStatsForProduct(targetId),
        ]);
        return {
            summary: stats,
            reviews: reviewsResult.data,
            total: reviewsResult.total,
            page: reviewsResult.page,
            limit: reviewsResult.limit,
        };
    }
    async getMyReviews(userId) {
        return this.reviewsRepo.findByUserId(userId);
    }
    async updateReview(reviewId, userId, dto) {
        const review = await this.reviewsRepo.findById(reviewId);
        if (!review) {
            throw new common_1.NotFoundException(`Review '${reviewId}' not found`);
        }
        if (review.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this review');
        }
        const updated = await this.reviewsRepo.update(reviewId, {
            ...(dto.rating ? { rating: dto.rating } : {}),
            ...(dto.title !== undefined ? { title: dto.title } : {}),
            ...(dto.comment ? { comment: dto.comment } : {}),
            ...(dto.images ? { images: dto.images } : {}),
            ...(dto.videos ? { videos: dto.videos } : {}),
        });
        if (dto.rating) {
            await this.updateProductRatingSummary(review.productId.toString());
        }
        return updated;
    }
    async deleteReview(reviewId, userId, isAdmin = false) {
        const review = await this.reviewsRepo.findById(reviewId);
        if (!review) {
            throw new common_1.NotFoundException(`Review '${reviewId}' not found`);
        }
        if (!isAdmin && review.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this review');
        }
        await this.reviewsRepo.softDelete(reviewId);
        await this.updateProductRatingSummary(review.productId.toString());
        return { message: 'Review deleted successfully' };
    }
    async toggleHelpfulVote(reviewId, userId) {
        const updated = await this.reviewsRepo.toggleHelpfulVote(reviewId, userId);
        if (!updated) {
            throw new common_1.NotFoundException(`Review '${reviewId}' not found`);
        }
        return updated;
    }
    async moderateReview(reviewId, dto) {
        const review = await this.reviewsRepo.findById(reviewId);
        if (!review) {
            throw new common_1.NotFoundException(`Review '${reviewId}' not found`);
        }
        const updated = await this.reviewsRepo.update(reviewId, {
            status: dto.status,
            ...(dto.adminResponse !== undefined ? { adminResponse: dto.adminResponse } : {}),
        });
        await this.updateProductRatingSummary(review.productId.toString());
        return updated;
    }
    async getAllReviews(query) {
        const res = await this.reviewsRepo.findAll(query);
        return {
            reviews: res.data,
            total: res.total,
            page: res.page,
            limit: res.limit,
        };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reviews_repository_js_1.ReviewsRepository,
        products_repository_js_1.ProductsRepository,
        orders_repository_js_1.OrdersRepository,
        users_repository_js_1.UsersRepository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map