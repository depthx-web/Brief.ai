import { BadRequestException, Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SafeUser } from '../auth/auth.service';
import { SignaturesService } from './signatures.service';

@ApiTags('signatures')
@ApiBearerAuth()
@Controller('signatures')
@UseGuards(JwtAuthGuard)
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Get()
  list(@CurrentUser() user: SafeUser) {
    return this.signaturesService.list(user.id);
  }

  @Post()
  create(
    @Body('name') name: string | undefined,
    @Body('imageData') imageData: string | undefined,
    @CurrentUser() user: SafeUser
  ) {
    if (!name?.trim() || !imageData) throw new BadRequestException('A name and image are required.');
    return this.signaturesService.create(user.id, name.trim(), imageData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    await this.signaturesService.remove(user.id, id);
    return { success: true };
  }
}
