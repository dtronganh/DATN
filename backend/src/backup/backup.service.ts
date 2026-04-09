import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import path from 'path';
import fs from 'fs';
import { FileService } from 'src/common/file.service';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class BackupService {
  constructor(
    private readonly fileService: FileService,
    private readonly configService: AppConfigService,
  ) {}

  @Cron('0 2 * * *')
  async handleBackup() {
    const date = new Date().toISOString().split('T')[0];
    const backupPath = path.join(__dirname, `../../backups/db-${date}.sqlite`);
    const dbPath = this.configService.sqliteDbPath;
    await this.cleanup();
    await this.fileService.copy(dbPath, backupPath);
  }

  private async cleanup() {
    const files = await this.fileService.readDirectory('./backups');
    files.forEach(async (file) => {
      const filePath = path.join('./backups', file);
      const stats = fs.statSync(filePath);
      const age = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
      if (age > 30) {
        await this.fileService.delete(filePath);
      }
    });
  }
}
