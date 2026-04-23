import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Product } from 'src/products/entities/product.entity';
import { AiChatboxController } from './ai-chatbox.controller';
import { AiChatboxService } from './ai-chatbox.service';
import { ConfigModule } from 'src/config/config.module';
import { AdminDashboardModule } from 'src/admin-dashboard/admin-dashboard.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), HttpModule, ConfigModule, AdminDashboardModule],
  controllers: [AiChatboxController],
  providers: [AiChatboxService],
})
export class AiChatboxModule {}
