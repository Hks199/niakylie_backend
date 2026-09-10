import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { User, UserSchema } from './schemas/user.schema.js';
import { Order, OrderSchema } from '../checkout/schemas/order.schema.js';
import { UsersRepository } from './repositories/users.repository.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { S3Module } from '../s3/s3.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    S3Module,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
