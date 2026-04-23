import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/entities/user.entity';
import {
  AdminDashboardExportQueryDto,
  AdminDashboardQueryDto,
} from './dto/admin-dashboard-query.dto';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('admin-dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RoleGuards)
@Roles(Role.ADMIN)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get admin dashboard overview' })
  async getOverview(@Query() query: AdminDashboardQueryDto) {
    return this.adminDashboardService.getOverview(query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export admin dashboard statistics to Excel' })
  async exportExcel(
    @Query() query: AdminDashboardExportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName } = await this.adminDashboardService.exportExcel(query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  }
}
