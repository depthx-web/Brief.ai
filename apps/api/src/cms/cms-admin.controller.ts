import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { CmsService } from './cms.service';

interface UpdateSeoBody {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImageUrl?: string;
}

// Separate from AdminController (which was already large before this) —
// same AdminAuthGuard, same /admin prefix convention, just its own file
// for a section with this many routes.
@ApiTags('admin-cms')
@UseGuards(AdminAuthGuard)
@Controller('admin/cms')
export class CmsAdminController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('pages')
  listPages() {
    return this.cmsService.listAvailablePages();
  }

  @Get('pages/:slug')
  getDraft(@Param('slug') slug: string) {
    return this.cmsService.getDraftForAdmin(slug);
  }

  @Patch('pages/:slug/sections/:key')
  async updateSection(@Param('slug') slug: string, @Param('key') key: string, @Body('fields') fields: unknown) {
    await this.cmsService.updateSectionDraft(slug, key, fields as never);
    return { success: true };
  }

  @Patch('pages/:slug/seo')
  async updateSeo(@Param('slug') slug: string, @Body() body: UpdateSeoBody) {
    await this.cmsService.updateSeo(slug, body);
    return { success: true };
  }

  @Post('pages/:slug/publish')
  async publish(@Param('slug') slug: string) {
    const publishedCount = await this.cmsService.publish(slug);
    return { success: true, publishedCount };
  }

  @Post('pages/:slug/discard')
  async discard(@Param('slug') slug: string) {
    await this.cmsService.discardDrafts(slug);
    return { success: true };
  }
}
