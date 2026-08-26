import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationType,
  NotificationChannel,
} from '../schemas/notification.schema.js';

export class BroadcastNotificationDto {
  @ApiProperty({ enum: NotificationType, example: NotificationType.OFFER, description: 'Notification type: OFFER, COUPON, PROMOTIONAL' })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type!: NotificationType;

  @ApiPropertyOptional({ enum: NotificationChannel, example: NotificationChannel.IN_APP })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiProperty({ example: 'Flat 30% Off Festivity Sale!', description: 'Broadcast title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Use code FESTIVE30 at checkout to enjoy flat 30% discount across all traditional wear.', description: 'Broadcast message' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ example: ['60d5ecb8b392d40015f8a001'], description: 'Optional list of user IDs. Omit to broadcast to all registered users.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetUserIds?: string[];

  @ApiPropertyOptional({ example: { couponCode: 'FESTIVE30', validTill: '2026-08-31' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
