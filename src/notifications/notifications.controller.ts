import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { NotificationsService } from './notifications.service.js';
import { NotificationEventsService } from './notification-events.service.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto.js';
import { QueryNotificationDto } from './dto/query-notification.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard, Roles, Role, CurrentUser } from '../shared/index.js';
import { User } from '../users/schemas/user.schema.js';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventsService: NotificationEventsService,
  ) {}

  @Sse('stream')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Real-time Server-Sent Events (SSE) notification stream' })
  streamNotifications(@CurrentUser() user: User): Observable<MessageEvent> {
    const userId = (user as any).id || (user as any)._id;
    return this.eventsService.getNotificationStream(userId) as any;
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, 'admin' as any)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Send targeted notification to user via Email, In-App, or SMS' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }

  @Post('broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, 'admin' as any)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Broadcast promotional offer or coupon alert to all or selected users' })
  @ApiResponse({ status: 200, description: 'Broadcast sent to target users' })
  async broadcastNotification(@Body() dto: BroadcastNotificationDto) {
    return this.notificationsService.broadcastNotification(dto);
  }

  @Get('my')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user in-app notifications with unread counter' })
  @ApiResponse({ status: 200, description: 'Customer in-app notifications returned' })
  async getMyNotifications(
    @CurrentUser() user: User,
    @Query() query: QueryNotificationDto,
  ) {
    const userId = (user as any).id || (user as any)._id;
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Get('my/unread-count')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get count of unread in-app notifications' })
  @ApiResponse({ status: 200, description: 'Unread count returned' })
  async getUnreadCount(@CurrentUser() user: User) {
    const userId = (user as any).id || (user as any)._id;
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch('my/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    const userId = (user as any).id || (user as any)._id;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('my/read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all unread notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: User) {
    const userId = (user as any).id || (user as any)._id;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete('my/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async deleteNotification(@Param('id') id: string, @CurrentUser() user: User) {
    const userId = (user as any).id || (user as any)._id;
    return this.notificationsService.deleteNotification(id, userId);
  }

  @Post('test-push')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test push notification to current user' })
  @ApiResponse({ status: 200, description: 'Test push notification dispatched' })
  async sendTestPush(@CurrentUser() user: User) {
    const userId = (user as any).id || (user as any)._id;
    return this.notificationsService.sendTestPushNotification(userId);
  }

  @Post('test-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test email notification to current user' })
  @ApiResponse({ status: 200, description: 'Test email notification dispatched' })
  async sendTestEmail(@CurrentUser() user: User) {
    const userId = (user as any).id || (user as any)._id;
    return this.notificationsService.sendTestEmailNotification(userId);
  }

  @Post('test-price-drop')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test price drop alert push notification' })
  async sendTestPriceDrop(@CurrentUser() user: User) {
    const userId = (user as any).id || (user as any)._id;
    return this.notificationsService.sendPriceDropTestNotification(userId);
  }

  @Post('test-collection-drop')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test new collection drop push notification' })
  async sendTestCollectionDrop(@CurrentUser() user: User) {
    const userId = (user as any).id || (user as any)._id;
    return this.notificationsService.sendNewCollectionTestNotification(userId);
  }

  @Post('test-coupon')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test exclusive coupon push notification' })
  async sendTestCoupon(@CurrentUser() user: User) {
    const userId = (user as any).id || (user as any)._id;
    return this.notificationsService.sendCouponTestNotification(userId);
  }

  @Post('test-admin-event')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, 'admin' as any)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Trigger live test admin event for notification bell' })
  async sendTestAdminEvent(@Query('type') type?: string) {
    return this.notificationsService.sendTestAdminEvent(type);
  }
}
