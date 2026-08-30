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
exports.ReviewsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_js_1 = require("../schemas/review.schema.js");
const query_review_dto_js_1 = require("../dto/query-review.dto.js");
let ReviewsRepository = class ReviewsRepository {
    reviewModel;
    constructor(reviewModel) {
        this.reviewModel = reviewModel;
    }
    async create(data) {
        const review = new this.reviewModel(data);
        return review.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.reviewModel.findOne({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }).exec();
    }
    async findByProductAndUser(productId, userId) {
        if (!mongoose_2.Types.ObjectId.isValid(productId) || !mongoose_2.Types.ObjectId.isValid(userId))
            return null;
        return this.reviewModel
            .findOne({
            productId: new mongoose_2.Types.ObjectId(productId),
            userId: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        })
            .exec();
    }
    async findProductReviews(productId, query) {
        const { page = 1, limit = 10, rating, sortBy = query_review_dto_js_1.ReviewSortBy.RECENT, status = review_schema_js_1.ReviewStatus.APPROVED } = query;
        const filter = {
            productId: new mongoose_2.Types.ObjectId(productId),
            isDeleted: false,
            status,
        };
        if (rating) {
            filter.rating = rating;
        }
        const sortOptions = {};
        if (sortBy === query_review_dto_js_1.ReviewSortBy.HELPFUL) {
            sortOptions.helpfulVotes = -1;
            sortOptions.createdAt = -1;
        }
        else if (sortBy === query_review_dto_js_1.ReviewSortBy.RATING_HIGH) {
            sortOptions.rating = -1;
            sortOptions.createdAt = -1;
        }
        else if (sortBy === query_review_dto_js_1.ReviewSortBy.RATING_LOW) {
            sortOptions.rating = 1;
            sortOptions.createdAt = -1;
        }
        else {
            sortOptions.createdAt = -1;
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.reviewModel.find(filter).sort(sortOptions).skip(skip).limit(limit).exec(),
            this.reviewModel.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async findAll(query) {
        const { page = 1, limit = 25, status, rating } = query;
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (rating)
            filter.rating = rating;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.reviewModel
                .find(filter)
                .populate('productId', 'title images')
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.reviewModel.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async findByUserId(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId))
            return [];
        return this.reviewModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId), isDeleted: false })
            .sort({ createdAt: -1 })
            .exec();
    }
    async update(id, updateData) {
        return this.reviewModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
            .exec();
    }
    async softDelete(id) {
        return this.reviewModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
            .exec();
    }
    async toggleHelpfulVote(reviewId, userId) {
        const review = await this.findById(reviewId);
        if (!review)
            return null;
        const userObjId = new mongoose_2.Types.ObjectId(userId);
        const hasVoted = review.votedUserIds.some((id) => id.toString() === userId);
        if (hasVoted) {
            return this.reviewModel
                .findOneAndUpdate({ _id: reviewId, isDeleted: false }, {
                $pull: { votedUserIds: userObjId },
                $inc: { helpfulVotes: -1 },
            }, { new: true })
                .exec();
        }
        else {
            return this.reviewModel
                .findOneAndUpdate({ _id: reviewId, isDeleted: false }, {
                $addToSet: { votedUserIds: userObjId },
                $inc: { helpfulVotes: 1 },
            }, { new: true })
                .exec();
        }
    }
    async getRatingStatsForProduct(productId) {
        const pId = new mongoose_2.Types.ObjectId(productId);
        const result = await this.reviewModel.aggregate([
            {
                $match: {
                    productId: pId,
                    status: review_schema_js_1.ReviewStatus.APPROVED,
                    isDeleted: false,
                },
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 },
                },
            },
        ]);
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalCount = 0;
        let totalScore = 0;
        for (const item of result) {
            const ratingVal = Number(item._id);
            const count = Number(item.count);
            if (ratingVal >= 1 && ratingVal <= 5) {
                breakdown[ratingVal] = count;
                totalCount += count;
                totalScore += ratingVal * count;
            }
        }
        const averageRating = totalCount > 0 ? Number((totalScore / totalCount).toFixed(1)) : 0;
        return {
            averageRating,
            reviewCount: totalCount,
            ratingBreakdown: breakdown,
        };
    }
};
exports.ReviewsRepository = ReviewsRepository;
exports.ReviewsRepository = ReviewsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_js_1.Review.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ReviewsRepository);
//# sourceMappingURL=reviews.repository.js.map