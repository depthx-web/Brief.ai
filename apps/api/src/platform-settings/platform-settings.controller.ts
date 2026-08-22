import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlatformSettingsService } from './platform-settings.service';

// Public and unauthenticated — the Download page needs this before a
// visitor has any session at all. Only ever returns the small public-safe
// subset (see PlatformSettingsService.getPublic), never the full row.
@ApiTags('platform-settings')
@Controller('platform-settings')
export class PlatformSettingsController {
  constructor(private readonly platformSettings: PlatformSettingsService) {}

  @Get('public')
  async getPublic() {
    return this.platformSettings.getPublic();
  }
}
