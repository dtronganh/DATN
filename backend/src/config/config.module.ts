import { Module } from '@nestjs/common';
import { AppConfigService } from './config.service';

@Module({
  exports: [AppConfigService],
  providers: [AppConfigService],
})
export class ConfigModule {}
