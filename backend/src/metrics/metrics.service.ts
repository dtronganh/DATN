import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly collectDefaultMetrics = client.collectDefaultMetrics;

  constructor() {
    this.collectDefaultMetrics();
  }

  async getMetrics(): Promise<string> {
    return await client.register.metrics();
  }
}
