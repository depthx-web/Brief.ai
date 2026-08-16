import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsService } from './cms.service';

// Public — this is what the live marketing site actually renders.
// ?preview=1 returns draft content instead, used only by the admin CMS
// editor's live-preview iframe. It's unauthenticated on purpose: the worst
// case is someone sees unpublished marketing copy a few seconds early, not
// a real security exposure, so it isn't worth the extra friction of an
// admin-token-gated iframe src.
@ApiTags('cms')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('pages/:slug')
  async getPage(@Param('slug') slug: string, @Query('preview') preview?: string) {
    return this.cmsService.getPublished(slug, preview === '1');
  }
}
