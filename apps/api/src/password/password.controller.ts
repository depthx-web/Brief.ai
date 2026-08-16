import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { FeatureGuard } from '../features/feature.guard';
import { RequireFeature } from '../features/require-feature.decorator';
import { PasswordService } from './password.service';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

@ApiTags('password')
@Controller()
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  // Passwords are sent as multipart form fields (not query params) so they
  // don't end up in URLs, access logs, or browser history.
  @Post('protect')
  @RequireFeature('PROTECT_PDF')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async protect(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('password') password: string | undefined,
    @Body('ownerPassword') ownerPassword: string | undefined,
    @Res() res: Response
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!password) throw new BadRequestException('A password is required.');

    let outputBuffer: Buffer;
    try {
      outputBuffer = await this.passwordService.protect(file, password, ownerPassword ?? '');
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not protect this PDF.'
      );
    }

    const baseName = file.originalname.replace(/\.[^.]+$/, '');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${baseName}-protected.pdf"`,
    });
    res.send(outputBuffer);
  }

  @Post('unlock')
  @RequireFeature('REMOVE_PASSWORD')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async unlock(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('password') password: string | undefined,
    @Res() res: Response
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!password) throw new BadRequestException('A password is required.');

    let outputBuffer: Buffer;
    try {
      outputBuffer = await this.passwordService.unlock(file, password);
    } catch (err) {
      // Most failures here are a wrong password rather than a server problem.
      throw new BadRequestException(
        err instanceof Error
          ? `Could not remove the password: ${err.message}`
          : 'Could not remove the password. It may be incorrect.'
      );
    }

    const baseName = file.originalname.replace(/\.[^.]+$/, '');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${baseName}-unlocked.pdf"`,
    });
    res.send(outputBuffer);
  }
}
