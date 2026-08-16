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
import { CompressionService, COMPRESSION_PRESETS, type CompressionPreset } from './compression.service';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

interface CompressBody {
  preset?: string;
}

function isPreset(value: string | undefined): value is CompressionPreset {
  return !!value && (COMPRESSION_PRESETS as readonly string[]).includes(value);
}

@ApiTags('compress')
@Controller('compress')
export class CompressionController {
  constructor(private readonly compressionService: CompressionService) {}

  @Post('high-ratio')
  @RequireFeature('COMPRESS_HIGH_RATIO')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async highRatio(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: CompressBody,
    @Res() res: Response
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Please upload a PDF file.');
    }
    const preset = isPreset(body.preset) ? body.preset : 'ebook';

    let outputBuffer: Buffer;
    try {
      outputBuffer = await this.compressionService.compress(file, preset);
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Compression failed.'
      );
    }

    const baseName = file.originalname.replace(/\.pdf$/i, '');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${baseName}-compressed.pdf"`,
    });
    res.send(outputBuffer);
  }
}
