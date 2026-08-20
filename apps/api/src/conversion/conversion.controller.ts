import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Logger,
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
import { ConversionService, TargetFormat } from './conversion.service';
import { assertPdfSignature, assertOfficeSignature } from '../common/file-signature';

const MIME_TYPES: Record<TargetFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

type OfficeFamily = 'word' | 'excel' | 'powerpoint';

const SOURCE_EXTENSIONS: Record<OfficeFamily, string[]> = {
  word: ['doc', 'docx'],
  excel: ['xls', 'xlsx'],
  powerpoint: ['ppt', 'pptx'],
};

const TARGET_FORMAT: Record<OfficeFamily, TargetFormat> = {
  word: 'docx',
  excel: 'xlsx',
  powerpoint: 'pptx',
};

const FAMILY_LABEL: Record<OfficeFamily, string> = {
  word: 'Word',
  excel: 'Excel',
  powerpoint: 'PowerPoint',
};

@ApiTags('convert')
@Controller('convert')
export class ConversionController {
  private readonly logger = new Logger(ConversionController.name);

  constructor(private readonly conversionService: ConversionService) {}

  // One route per format per direction (not one generic /convert?to=) so
  // each carries its own static @RequireFeature key — FeatureGuard reads
  // that key from route metadata, so a single dynamically-branching
  // endpoint couldn't be gated per-tool the same way the rest of the app's
  // feature-gated routes are. The underlying engine (LibreOffice via
  // ConversionService) is already format-generic; this only adds routing
  // and per-format admin control on top of it.

  @Post('word-to-pdf')
  @RequireFeature('WORD_TO_PDF')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async wordToPdf(@UploadedFile() file: Express.Multer.File | undefined, @Res() res: Response) {
    await this.runOfficeToPdf(file, 'word', res);
  }

  @Post('excel-to-pdf')
  @RequireFeature('EXCEL_TO_PDF')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async excelToPdf(@UploadedFile() file: Express.Multer.File | undefined, @Res() res: Response) {
    await this.runOfficeToPdf(file, 'excel', res);
  }

  @Post('powerpoint-to-pdf')
  @RequireFeature('POWERPOINT_TO_PDF')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async powerpointToPdf(@UploadedFile() file: Express.Multer.File | undefined, @Res() res: Response) {
    await this.runOfficeToPdf(file, 'powerpoint', res);
  }

  @Post('pdf-to-word')
  @RequireFeature('PDF_TO_WORD')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async pdfToWord(@UploadedFile() file: Express.Multer.File | undefined, @Res() res: Response) {
    await this.runPdfToOffice(file, 'word', res);
  }

  @Post('pdf-to-excel')
  @RequireFeature('PDF_TO_EXCEL')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async pdfToExcel(@UploadedFile() file: Express.Multer.File | undefined, @Res() res: Response) {
    await this.runPdfToOffice(file, 'excel', res);
  }

  @Post('pdf-to-powerpoint')
  @RequireFeature('PDF_TO_POWERPOINT')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async pdfToPowerpoint(@UploadedFile() file: Express.Multer.File | undefined, @Res() res: Response) {
    await this.runPdfToOffice(file, 'powerpoint', res);
  }

  @Post('pdf-to-html')
  @RequireFeature('PDF_TO_HTML')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async pdfToHtml(@UploadedFile() file: Express.Multer.File | undefined, @Res() res: Response) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Please upload a PDF file.');
    }
    assertPdfSignature(file);

    let outputBuffer: Buffer;
    try {
      outputBuffer = await this.conversionService.convertToHtml(file);
    } catch (err) {
      this.logger.error(err instanceof Error ? err.message : String(err));
      throw new InternalServerErrorException('Conversion failed.');
    }

    const baseName = file.originalname.replace(/\.pdf$/i, '');
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${baseName}.html"`,
    });
    res.send(outputBuffer);
  }

  private async runOfficeToPdf(file: Express.Multer.File | undefined, family: OfficeFamily, res: Response): Promise<void> {
    if (!file) throw new BadRequestException('No file uploaded.');
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!ext || !SOURCE_EXTENSIONS[family].includes(ext)) {
      throw new BadRequestException(
        `Please upload a ${FAMILY_LABEL[family]} file (${SOURCE_EXTENSIONS[family].map((e) => `.${e}`).join(', ')}).`
      );
    }
    assertOfficeSignature(file);
    await this.runConversion(file, 'pdf', res);
  }

  private async runPdfToOffice(file: Express.Multer.File | undefined, family: OfficeFamily, res: Response): Promise<void> {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Please upload a PDF file.');
    }
    assertPdfSignature(file);
    await this.runConversion(file, TARGET_FORMAT[family], res);
  }

  private async runConversion(file: Express.Multer.File, to: TargetFormat, res: Response): Promise<void> {
    let outputBuffer: Buffer;
    try {
      outputBuffer = await this.conversionService.convert(file, to);
    } catch (err) {
      this.logger.error(err instanceof Error ? err.message : String(err));
      throw new InternalServerErrorException('Conversion failed.');
    }

    const baseName = file.originalname.replace(/\.[^.]+$/, '');
    res.set({
      'Content-Type': MIME_TYPES[to],
      'Content-Disposition': `attachment; filename="${baseName}.${to}"`,
    });
    res.send(outputBuffer);
  }
}
