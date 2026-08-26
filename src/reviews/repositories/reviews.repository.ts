import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument, ReviewStatus } from '../schemas/review.schema.js';
import { QueryReviewDto, ReviewSortBy } from '../dto/query-review.dto.js';

export interface RatingStats {
  averageRating: number;
  reviewCount: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async create(data: Partial<Review>): Promise<ReviewDocument> {
    const review = new this.reviewModel(data);
    return review.save();
  }

  async findById(id: string): Promise<ReviewDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.reviewModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).exec();
  }

  async findByProductAndUser(productId: string, userId: string): Promise<ReviewDocument | null> {
    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(userId)) return null;
    return this.reviewModel
      .findOne({
        productId: new Types.ObjectId(productId),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      })
      .exec();
  }

  async findProductReviews(
    productId: string,
    query: QueryReviewDto,
  ): Promise<{ data: ReviewDocument[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, rating, sortBy = ReviewSortBy.RECENT, status = ReviewStatus.APPROVED } = query;
    const filter: Record<string, any> = {
      productId: new Types.ObjectId(productId),
      isDeleted: false,
      status,
    };

    if (rating) {
      filter.rating = rating;
    }

    const sortOptions: Record<string, any> = {};
    if (sortBy === ReviewSortBy.HELPFUL) {
      sortOptions.helpfulVotes = -1;
      sortOptions.createdAt = -1;
    } else if (sortBy === ReviewSortBy.RATING_HIGH) {
      sortOptions.rating = -1;
      sortOptions.createdAt = -1;
    } else if (sortBy === ReviewSortBy.RATING_LOW) {
      sortOptions.rating = 1;
      sortOptions.createdAt = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.reviewModel.find(filter).sort(sortOptions).skip(skip).limit(limit).exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async findByUserId(userId: string): Promise<ReviewDocument[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    return this.reviewModel
      .find({ userId: new Types.ObjectId(userId), isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateData: Partial<Review>): Promise<ReviewDocument | null> {
    return this.reviewModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<ReviewDocument | null> {
    return this.reviewModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
      .exec();
  }

  async toggleHelpfulVote(reviewId: string, userId: string): Promise<ReviewDocument | null> {
    const review = await this.findById(reviewId);
    if (!review) return null;

    const userObjId = new Types.ObjectId(userId);
    const hasVoted = review.votedUserIds.some((id) => id.toString() === userId);

    if (hasVoted) {
      return this.reviewModel
        .findOneAndUpdate(
          { _id: reviewId, isDeleted: false },
          {
            $pull: { votedUserIds: userObjId },
            $inc: { helpfulVotes: -1 },
          },
          { new: true },
        )
        .exec();
    } else {
      return this.reviewModel
        .findOneAndUpdate(
          { _id: reviewId, isDeleted: false },
          {
            $addToSet: { votedUserIds: userObjId },
            $inc: { helpfulVotes: 1 },
          },
          { new: true },
        )
        .exec();
    }
  }

  async getRatingStatsForProduct(productId: string): Promise<RatingStats> {
    const pId = new Types.ObjectId(productId);
    const result = await this.reviewModel.aggregate([
      {
        $match: {
          productId: pId,
          status: ReviewStatus.APPROVED,
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

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
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
      ratingBreakdown: breakdown as any,
    };
  }
}
