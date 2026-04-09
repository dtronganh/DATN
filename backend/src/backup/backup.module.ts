import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BaseModule } from 'src/common/base.module';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [BaseModule, ConfigModule],
  providers: [BackupService],
})
export class BackupModule {}
