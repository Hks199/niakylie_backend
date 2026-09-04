import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schemas/notification.schema.js';
import { NotificationsRepository } from './repositories/notifications.repository.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';

import { EmailProvider } from './providers/email.provider.js';
import { SmsProvider } from './providers/sms.provider.js';
import { UsersModule } from '../users/users.module.js';

import { NotificationEventsService } from './notification-events.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    UsersModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationEventsService,
    EmailProvider,
    SmsProvider,
  ],
  exports: [NotificationsService, NotificationEventsService, EmailProvider, SmsProvider],
})
export class NotificationsModule {}
