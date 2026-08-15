import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SafeUser } from '../auth/auth.service';
import { LibraryService } from './library.service';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

@ApiTags('library')
@ApiBearerAuth()
@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post('documents')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async addDocument(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('text') text: string | undefined,
    @Body('docType') docType: string | undefined,
    @Body('projectId') projectId: string | undefined,
    @CurrentUser() user: SafeUser
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!text?.trim()) throw new BadRequestException('No extracted text provided.');
    return this.libraryService.addDocument(user.id, file, text, docType, projectId);
  }

  @Post('projects')
  async createProject(
    @Body('name') name: string | undefined,
    @Body('category') category: string | undefined,
    @Body('retentionDays') retentionDays: number | undefined,
    @CurrentUser() user: SafeUser
  ) {
    if (!name?.trim()) throw new BadRequestException('A project name is required.');
    return this.libraryService.createProject(user.id, name.trim(), category, retentionDays);
  }

  @Get('projects')
  async listProjects(@CurrentUser() user: SafeUser) {
    return this.libraryService.listProjects(user.id);
  }

  @Get('projects/:id')
  async getProject(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    return this.libraryService.getProject(user.id, id);
  }

  @Patch('projects/:id/retention')
  async extendRetention(
    @Param('id') id: string,
    @Body('days') days: number | undefined,
    @CurrentUser() user: SafeUser
  ) {
    if (!days) throw new BadRequestException('A retention length (7 or 30 days) is required.');
    return this.libraryService.extendProjectRetention(user.id, id, days);
  }

  @Delete('projects/:id')
  async removeProject(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    await this.libraryService.removeProject(user.id, id);
    return { success: true };
  }

  @Get('documents')
  async list(@CurrentUser() user: SafeUser) {
    return this.libraryService.list(user.id);
  }

  @Get('documents/:id/file')
  async getFile(@Param('id') id: string, @CurrentUser() user: SafeUser, @Res() res: Response) {
    const { buffer, filename } = await this.libraryService.getFile(user.id, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(buffer);
  }

  @Patch('documents/:id')
  async rename(
    @Param('id') id: string,
    @Body('filename') filename: string | undefined,
    @CurrentUser() user: SafeUser
  ) {
    if (!filename?.trim()) throw new BadRequestException('A file name is required.');
    return this.libraryService.rename(user.id, id, filename.trim());
  }

  @Delete('documents/:id')
  async remove(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    await this.libraryService.remove(user.id, id);
    return { success: true };
  }

  @Post('search')
  async search(@Body('query') query: string | undefined, @CurrentUser() user: SafeUser) {
    if (!query?.trim()) throw new BadRequestException('No search query provided.');
    return this.libraryService.search(user.id, query);
  }
}
