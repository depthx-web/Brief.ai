import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FeatureService } from './feature.service';

// Public — drives the Pricing page's Free vs. paid feature lists directly
// from the same Feature rows the admin panel edits (Plans & Pricing →
// Features per plan), so toggling freeEnabled there actually changes what a
// visitor sees instead of being purely decorative admin-side data.
@ApiTags('features')
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  async list() {
    const features = await this.featureService.list();
    return features.map((f) => ({
      segment: f.segment,
      key: f.key,
      label: f.label,
      freeEnabled: f.freeEnabled,
      order: f.order,
    }));
  }
}
