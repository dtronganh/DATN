import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('metrics')
@Controller('metrics')
@SkipThrottle()
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics in text format', type: String })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
