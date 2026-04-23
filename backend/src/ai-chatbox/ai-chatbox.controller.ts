import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiChatboxService } from './ai-chatbox.service';
import {
  AiChatboxAnswerResult,
  AiChatboxInquiryDto,
} from './dto/ai-chatbox-inquiry.dto';
import {
  AdminStatsInquiryDto,
  AdminStatsInquiryResult,
} from './dto/admin-stats-inquiry.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuards } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/entities/user.entity';

@ApiTags('chatbot')
@Controller('chatbot')
export class AiChatboxController {
  constructor(private readonly aiChatboxService: AiChatboxService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ask AI chatbot and receive product suggestions' })
  @ApiResponse({ status: 200, description: 'Chatbot answer returned successfully' })
  async ask(
    @Body() payload: AiChatboxInquiryDto,
  ): Promise<AiChatboxAnswerResult> {
    return this.aiChatboxService.handleConversation(payload);
  }

  @Post('admin/stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Ask rule-based AI insight for admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Admin statistics insight returned successfully' })
  async askAdminStats(
    @Body() payload: AdminStatsInquiryDto,
  ): Promise<AdminStatsInquiryResult> {
    return this.aiChatboxService.handleAdminStatsConversation(payload);
  }
}
