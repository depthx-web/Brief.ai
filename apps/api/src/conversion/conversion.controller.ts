import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ALLOWED_TARGET_FORMATS, ConversionService, TargetFormat } from './conversion.service';

const MIME_TYPES: Record<TargetFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

function isTargetFormat(value: string): value is TargetFormat {
  return (ALLOWED_TARGET_FORMATS as readonly string[]).includes(value);
}

@Controller('convert')
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async convert(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('to') to: string | undefined,
    @Res() res: Response
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    if (!to || !isTargetFormat(to)) {
      throw new BadRequestException(
        `Unsupported target format. Allowed: ${ALLOWED_TARGET_FORMATS.join(', ')}`
      );
    }

    let outputBuffer: Buffer;
    try {
      outputBuffer = await this.conversionService.convert(file, to);
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Conversion failed.'
      );
    }

    const baseName = file.originalname.replace(/\.[^.]+$/, '');
    res.set({
      'Content-Type': MIME_TYPES[to],
      'Content-Disposition': `attachment; filename="${baseName}.${to}"`,
    });
    res.send(outputBuffer);
  }
}
