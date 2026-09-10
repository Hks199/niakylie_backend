import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Role, Roles, RolesGuard } from '../shared/index.js';
import { UpdateShippingConfigDto } from './dto/update-shipping-config.dto.js';
import { ShippingService } from './shipping.service.js';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get customer delivery-fee configuration' })
  getConfig() {
    return this.shippingService.getConfig();
  }

  @Get('config/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get delivery-fee configuration for admin' })
  getAdminConfig() {
    return this.shippingService.getConfig();
  }

  @Put('config/admin')
  @Post('config/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update delivery-fee configuration' })
  updateConfig(@Body() dto: UpdateShippingConfigDto) {
    return this.shippingService.updateConfig(dto);
  }
}
