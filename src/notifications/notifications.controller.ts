import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { NotificationsService } from './notifications.service.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto.js';
import { QueryNotificationDto } from './dto/query-notification.dto.js';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Send targeted notification to user via Email, In-App, or SMS' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }

  @Post('broadcast')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Broadcast promotional offer or coupon alert to all or selected users' })
  @ApiResponse({ status: 200, description: 'Broadcast sent to target users' })
  async broadcastNotification(@Body() dto: BroadcastNotificationDto) {
    return this.notificationsService.broadcastNotification(dto);
  }

  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user in-app notifications with unread counter' })
  @ApiResponse({ status: 200, description: 'Customer in-app notifications returned' })
  async getMyNotifications(@Req() req: any, @Query() query: QueryNotificationDto) {
    const userId = req.user?.id || req.user?._id;
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Get('my/unread-count')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get count of unread in-app notifications' })
  @ApiResponse({ status: 200, description: 'Unread count returned' })
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch('my/:id/read')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('my/read-all')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all unread notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete('my/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async deleteNotification(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.notificationsService.deleteNotification(id, userId);
  }
}
