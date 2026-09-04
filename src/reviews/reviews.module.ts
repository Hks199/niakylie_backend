import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schemas/review.schema.js';
import { ReviewsRepository } from './repositories/reviews.repository.js';
import { ReviewsService } from './reviews.service.js';
import { ReviewsController } from './reviews.controller.js';
import { ProductReviewsController } from './product-reviews.controller.js';

import { ProductsModule } from '../products/products.module.js';
import { CheckoutModule } from '../checkout/checkout.module.js';
import { UsersModule } from '../users/users.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    ProductsModule,
    CheckoutModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [ReviewsController, ProductReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
