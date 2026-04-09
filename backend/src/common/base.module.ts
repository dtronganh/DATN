import { Module } from '@nestjs/common';
import { FormattingService } from './formatting.service';
import { SlugService } from './slug.service';
import { FileService } from './file.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';

@Module({
  providers: [FormattingService, SlugService, FileService],
  exports: [FormattingService, SlugService, FileService],
})
export class BaseModule {}
