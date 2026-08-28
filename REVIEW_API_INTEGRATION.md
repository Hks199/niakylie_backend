# NiaKylie – Review & Rating API Integration Reference

> **Purpose**: Master integration specification for all **Product Reviews & Ratings APIs** (Customer & Admin). Any AI or frontend developer can use this guide to connect Product Detail Page (PDP) review sections, rating breakdown bars, verified buyer badges, customer dashboard reviews, and Admin Moderation Panels with 100% contract compliance.  
> **Base URL**: `http://localhost:3000/api/v1` (Dev) | `https://api.niakylie.com/api/v1` (Prod)  
> **Auth Requirements**:
> - `GET /reviews/product/:productId` & `GET /products/:id/reviews`: Public (No token required)
> - `POST /reviews`, `GET /reviews/my`, `PUT /reviews/:id`, `DELETE /reviews/:id`, `POST /reviews/:id/vote-helpful`: Requires JWT Bearer Token (`Authorization: Bearer <accessToken>`)
> - `PATCH /reviews/admin/:id/moderate`: Requires JWT Bearer Token with `roles: ["ADMIN"]` or `"admin"`.

---

## 1. Quick Reference: Review Routes Table

| Method | Endpoint | Description | Content-Type | Auth Required |
|---|---|---|---|---|
| `GET` | `/reviews/product/:productId` | Get approved reviews, average rating & breakdown stats for a product | — | Public |
| `GET` | `/products/:id/reviews` | Alias route to fetch approved reviews for a product | — | Public |
| `POST` | `/reviews` | Submit product review (checks delivered order history for verified buyer badge) | `application/json` | ✅ JWT Token |
| `GET` | `/reviews/my` | Get all reviews submitted by current logged-in customer | — | ✅ JWT Token |
| `PUT` | `/reviews/:id` | Update customer's own review title, comment, rating or attachments | `application/json` | ✅ JWT Token |
| `DELETE` | `/reviews/:id` | Soft-delete review (allowed for review owner or Admin) | — | ✅ JWT Token |
| `POST` | `/reviews/:id/vote-helpful` | Toggle helpful upvote on a review (one vote per customer) | — | ✅ JWT Token |
| `PATCH` | `/reviews/admin/:id/moderate` | [Admin] Approve/Reject review & add official brand response | `application/json` | ✅ JWT + ADMIN |

---

## 2. TypeScript Interfaces (`src/types/review.ts`)

```ts
// ── Review Status & Sort Enums ────────────────────────────
export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ReviewSortBy {
  RECENT = 'recent',
  HELPFUL = 'helpful',
  RATING_HIGH = 'rating_high',
  RATING_LOW = 'rating_low',
}

// ── Rating Breakdown Stats Interface ─────────────────────
export interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface RatingSummary {
  averageRating: number;      // e.g. 4.8
  reviewCount: number;        // e.g. 124
  ratingBreakdown: RatingBreakdown;
}

// ── Master Review Entity Interface ────────────────────────
export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;             // 1 to 5
  title?: string;
  comment: string;
  images: string[];           // Attachment image URLs
  videos: string[];           // Attachment video URLs
  isVerifiedPurchase: boolean; // Auto-calculated based on user order history
  helpfulVotes: number;       // Upvote count
  votedUserIds: string[];     // User IDs who upvoted
  status: ReviewStatus;
  adminResponse?: string;     // Official brand reply
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Product Reviews Paginated Response ────────────────────
export interface ProductReviewsResponse {
  summary: RatingSummary;
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}

// ── Query Parameters for GET /reviews/product/:productId ─
export interface QueryReviewParams {
  page?: number;              // Default: 1
  limit?: number;             // Default: 10
  rating?: number;            // Filter by rating score (1 to 5)
  sortBy?: ReviewSortBy;      // 'recent' | 'helpful' | 'rating_high' | 'rating_low'
  status?: ReviewStatus;      // Admin filter
}

// ── Create Review Input Payload ────────────────────────────
export interface CreateReviewInput {
  productId: string;
  rating: number;             // 1 to 5 (Required)
  title?: string;
  comment: string;            // Detailed review text (Required)
  images?: string[];          // Array of image URL strings
  videos?: string[];          // Array of video URL strings
}

// ── Update Review Input Payload ────────────────────────────
export interface UpdateReviewInput extends Partial<Omit<CreateReviewInput, 'productId'>> {}

// ── Moderate Review Input Payload (Admin) ──────────────────
export interface ModerateReviewInput {
  status: ReviewStatus;
  adminResponse?: string;
}
```

---

## 3. Detailed Endpoint Contracts

### 3.1 Fetch Product Reviews & Breakdown (`GET /reviews/product/:productId`)
- **Description**: Retrieves approved reviews and aggregated rating summary (average rating score, total review count, rating distribution) for a given product ID or Slug.
- **Auth Required**: Public
- **Query Parameters**:
  - `page` (number, default: `1`)
  - `limit` (number, default: `10`)
  - `rating` (number, optional): Filter reviews by exact rating (1 to 5)
  - `sortBy` (`recent` | `helpful` | `rating_high` | `rating_low`, default: `recent`)

#### Request Example
`GET http://localhost:3000/api/v1/reviews/product/60d5ecb8b392d40015f8a001?rating=5&sortBy=helpful`

#### Success Response (`HTTP 200 OK`)
```json
{
  "summary": {
    "averageRating": 4.8,
    "reviewCount": 25,
    "ratingBreakdown": {
      "5": 20,
      "4": 3,
      "3": 1,
      "2": 1,
      "1": 0
    }
  },
  "reviews": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c100",
      "productId": "60d5ecb8b392d40015f8a001",
      "userId": "64f1a2b3c4d5e6f7a8b9c005",
      "userName": "Ananya Sharma",
      "rating": 5,
      "title": "Exquisite silk finish & gorgeous drape!",
      "comment": "The fabric quality and border work are top notch. Received so many compliments during the wedding function.",
      "images": ["https://cdn.niakylie.com/reviews/review-1.webp"],
      "videos": [],
      "isVerifiedPurchase": true,
      "helpfulVotes": 14,
      "votedUserIds": ["64f1a2b3c4d5e6f7a8b9c009"],
      "status": "APPROVED",
      "adminResponse": "Thank you for the lovely feedback, Ananya! We are thrilled you enjoyed the piece.",
      "isDeleted": false,
      "createdAt": "2026-08-26T10:00:00.000Z",
      "updatedAt": "2026-08-26T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

### 3.2 Submit Product Review (`POST /reviews`)
- **Description**: Submits a customer review for a product. Automatically checks if the user has a delivered order containing this product to award `isVerifiedPurchase = true`. Automatically recalculates the product's overall rating summary.
- **Auth Required**: ✅ JWT Bearer Token
- **Content-Type**: `application/json`

#### Request Payload Example
```json
{
  "productId": "60d5ecb8b392d40015f8a001",
  "rating": 5,
  "title": "Flawless fitting and vibrant colour",
  "comment": "Super soft silk and stitching is perfect. Shipped quickly within 2 days.",
  "images": ["https://cdn.niakylie.com/uploads/review1.jpg"]
}
```

#### Success Response (`HTTP 201 Created`)
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c101",
  "productId": "60d5ecb8b392d40015f8a001",
  "userId": "64f1a2b3c4d5e6f7a8b9c005",
  "userName": "Priya Patel",
  "rating": 5,
  "title": "Flawless fitting and vibrant colour",
  "comment": "Super soft silk and stitching is perfect. Shipped quickly within 2 days.",
  "images": ["https://cdn.niakylie.com/uploads/review1.jpg"],
  "videos": [],
  "isVerifiedPurchase": true,
  "helpfulVotes": 0,
  "votedUserIds": [],
  "status": "APPROVED",
  "isDeleted": false,
  "createdAt": "2026-08-26T12:00:00.000Z",
  "updatedAt": "2026-08-26T12:00:00.000Z"
}
```

#### Error Response (`HTTP 400 Bad Request` - Duplicate Review)
```json
{
  "statusCode": 400,
  "message": "You have already submitted a review for this product",
  "error": "Bad Request"
}
```

---

### 3.3 Fetch Customer's Own Reviews (`GET /reviews/my`)
- **Description**: Returns all reviews created by the authenticated user.
- **Auth Required**: ✅ JWT Bearer Token

#### Success Response (`HTTP 200 OK`)
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c101",
    "productId": "60d5ecb8b392d40015f8a001",
    "rating": 5,
    "title": "Flawless fitting and vibrant colour",
    "comment": "Super soft silk and stitching is perfect.",
    "status": "APPROVED",
    "createdAt": "2026-08-26T12:00:00.000Z"
  }
]
```

---

### 3.4 Upvote Review as Helpful (`POST /reviews/:id/vote-helpful`)
- **Description**: Toggles a helpful vote on a review. Tapping again removes the vote.
- **Auth Required**: ✅ JWT Bearer Token

#### Success Response (`HTTP 200 OK`)
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c100",
  "helpfulVotes": 15,
  "votedUserIds": ["64f1a2b3c4d5e6f7a8b9c005", "64f1a2b3c4d5e6f7a8b9c009"]
}
```

---

### 3.5 Admin Moderate Review (`PATCH /reviews/admin/:id/moderate`)
- **Description**: Allows administrators to approve/reject reviews and post official brand responses.
- **Auth Required**: ✅ JWT Bearer Token (`roles: ["ADMIN"]`)

#### Request Payload Example
```json
{
  "status": "APPROVED",
  "adminResponse": "Thank you for shopping with NiaKylie! We're glad you loved the dress."
}
```

#### Success Response (`HTTP 200 OK`)
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c100",
  "status": "APPROVED",
  "adminResponse": "Thank you for shopping with NiaKylie! We're glad you loved the dress.",
  "updatedAt": "2026-08-26T13:00:00.000Z"
}
```

---

## 4. Frontend Integration Implementation Code

### 4.1 Axios API Client (`src/api/reviews.ts`)

```ts
import { apiClient } from './client';
import {
  Review,
  ProductReviewsResponse,
  QueryReviewParams,
  CreateReviewInput,
  UpdateReviewInput,
  ModerateReviewInput,
} from '../types/review';

export const reviewsApi = {
  /**
   * Get public reviews & rating breakdown for a product by ID or Slug.
   */
  getProductReviews: (
    productId: string,
    params?: QueryReviewParams,
  ): Promise<ProductReviewsResponse> =>
    apiClient.get(`/reviews/product/${productId}`, { params }),

  /**
   * Submit a product review.
   */
  createReview: (data: CreateReviewInput): Promise<Review> =>
    apiClient.post('/reviews', data),

  /**
   * Get all reviews submitted by the logged-in customer.
   */
  getMyReviews: (): Promise<Review[]> =>
    apiClient.get('/reviews/my'),

  /**
   * Update customer's own review.
   */
  updateReview: (id: string, data: UpdateReviewInput): Promise<Review> =>
    apiClient.put(`/reviews/${id}`, data),

  /**
   * Delete review by ID.
   */
  deleteReview: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/reviews/${id}`),

  /**
   * Toggle helpful vote on a review.
   */
  voteHelpful: (id: string): Promise<Review> =>
    apiClient.post(`/reviews/${id}/vote-helpful`),

  /**
   * Admin: Moderate review status and add official response.
   */
  moderateReview: (id: string, data: ModerateReviewInput): Promise<Review> =>
    apiClient.patch(`/reviews/admin/${id}/moderate`, data),
};
```

---

### 4.2 React Product Reviews & Rating Component (`ProductReviewsSection.tsx`)

```tsx
import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../api/reviews';
import { ProductReviewsResponse, Review, ReviewSortBy } from '../types/review';

interface Props {
  productId: string;
  isAuthenticated: boolean;
}

export function ProductReviewsSection({ productId, isAuthenticated }: Props) {
  const [data, setData] = useState<ProductReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<ReviewSortBy>(ReviewSortBy.RECENT);

  // Review Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.getProductReviews(productId, {
        rating: selectedRating,
        sortBy,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, selectedRating, sortBy]);

  const handleVoteHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to upvote reviews');
      return;
    }
    try {
      const updated = await reviewsApi.voteHelpful(reviewId);
      setData((prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.map((r) => (r._id === reviewId ? updated : r)),
            }
          : prev,
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to vote');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewsApi.createReview({
        productId,
        rating,
        title,
        comment,
      });
      alert('Review submitted successfully!');
      setIsModalOpen(false);
      setTitle('');
      setComment('');
      fetchReviews();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return <div className="p-6 text-center text-gray-500">Loading reviews...</div>;
  }

  const summary = data?.summary || { averageRating: 0, reviewCount: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Ratings & Reviews</h2>
          <p className="text-sm text-gray-500">Real feedback from verified NiaKylie shoppers</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* RATING SUMMARY & BREAKDOWN BARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-xl">
        <div className="flex flex-col justify-center items-center text-center border-r-0 md:border-r border-gray-200 pr-0 md:pr-6">
          <span className="text-5xl font-extrabold text-gray-900">{summary.averageRating.toFixed(1)}</span>
          <div className="text-yellow-400 text-xl my-1">
            {'★'.repeat(Math.round(summary.averageRating)) + '☆'.repeat(5 - Math.round(summary.averageRating))}
          </div>
          <span className="text-xs text-gray-500 font-medium">Based on {summary.reviewCount} reviews</span>
        </div>

        <div className="col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = (summary.ratingBreakdown as any)[stars] || 0;
            const percent = summary.reviewCount > 0 ? (count / summary.reviewCount) * 100 : 0;
            return (
              <button
                key={stars}
                onClick={() => setSelectedRating(selectedRating === stars ? undefined : stars)}
                className={`w-full flex items-center text-xs gap-3 p-1 rounded-lg transition-colors ${
                  selectedRating === stars ? 'bg-red-50 text-red-700 font-semibold' : 'hover:bg-gray-100'
                }`}
              >
                <span className="w-12 text-left font-medium">{stars} Stars</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-8 text-right text-gray-500">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SORT CONTROLS */}
      <div className="flex justify-between items-center border-b pb-4">
        <span className="text-sm font-semibold text-gray-700">{data?.total || 0} Reviews</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as ReviewSortBy)}
          className="border rounded-lg px-3 py-1.5 text-xs font-medium bg-white"
        >
          <option value={ReviewSortBy.RECENT}>Most Recent</option>
          <option value={ReviewSortBy.HELPFUL}>Most Helpful</option>
          <option value={ReviewSortBy.RATING_HIGH}>Highest Rating</option>
          <option value={ReviewSortBy.RATING_LOW}>Lowest Rating</option>
        </select>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-6">
        {data?.reviews.map((rev) => (
          <div key={rev._id} className="border-b border-gray-100 pb-6 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900">{rev.userName}</span>
                {rev.isVerifiedPurchase && (
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    ✓ Verified Buyer
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-yellow-400 text-sm">{'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}</div>
              {rev.title && <h4 className="font-bold text-sm text-gray-900">{rev.title}</h4>}
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">{rev.comment}</p>

            {/* ATTACHMENTS */}
            {rev.images.length > 0 && (
              <div className="flex gap-2 pt-1">
                {rev.images.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt="Customer review attachment"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}

            {/* BRAND OFFICIAL RESPONSE */}
            {rev.adminResponse && (
              <div className="bg-red-50/60 border-l-4 border-red-500 p-3 rounded-r-lg text-xs space-y-1">
                <span className="font-bold text-red-900">NiaKylie Official Response:</span>
                <p className="text-gray-700">{rev.adminResponse}</p>
              </div>
            )}

            {/* HELPFUL BUTTON */}
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
              <button
                onClick={() => handleVoteHelpful(rev._id)}
                className="flex items-center gap-1 hover:text-red-600 transition-colors font-medium"
              >
                👍 Helpful ({rev.helpfulVotes})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* WRITE REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Review Title</label>
                <input
                  type="text"
                  placeholder="Summarize your thoughts"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Review Details *</label>
                <textarea
                  placeholder="What did you like or dislike about this product?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={4}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```
