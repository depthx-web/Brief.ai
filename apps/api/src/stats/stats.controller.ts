import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';

// Public and unauthenticated — homepage trust stats, and the anonymous
// counter client-side tools ping on completion. No file content or user
// identity involved either way.
@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('homepage')
  async getHomepageStats() {
    return this.statsService.getCached();
  }

  @Post('client-operation')
  async recordClientOperation(@Body('tool') tool?: string) {
    await this.statsService.recordClientOperation(typeof tool === 'string' ? tool : undefined);
    return { ok: true };
  }
}
