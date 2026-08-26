import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationType,
  NotificationChannel,
} from '../schemas/notification.schema.js';

export class SendNotificationDto {
  @ApiPropertyOptional({ example: '60d5ecb8b392d40015f8a001', description: 'Target user Mongo ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'customer@example.com', description: 'Recipient email address' })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({ example: '+919876543210', description: 'Recipient phone number for SMS' })
  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.ORDER_UPDATE })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type!: NotificationType;

  @ApiPropertyOptional({ enum: NotificationChannel, example: NotificationChannel.IN_APP })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiProperty({ example: 'Order Shipped!', description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Your order #NK-ORD-20260807-1234 has been shipped via BlueDart.', description: 'Notification body' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ example: { orderId: 'NK-ORD-20260807-1234', trackingNumber: 'BL123' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
