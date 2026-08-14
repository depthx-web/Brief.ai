import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CurrentUser, OptionalCurrentUser } from '../auth/current-user.decorator';
import type { SafeUser } from '../auth/auth.service';
import {
  AiService,
  ChatMessage,
  PageText,
  ReferenceFormat,
  SummaryLength,
  SummaryStyle,
} from './ai.service';

interface SummarizeBody {
  pages?: PageText[];
  style?: string;
  length?: string;
}

interface ChatBody {
  pages?: PageText[];
  history?: ChatMessage[];
  question?: string;
}

interface AnalyzeClausesBody {
  pages?: PageText[];
}

interface ExtractReferencesBody {
  pages?: PageText[];
  format?: string;
}

interface ExtractInvoiceBody {
  pages?: PageText[];
}

// Tighter than the app-wide default (60/min) — every call here costs real
// money against the LLM provider.
@ApiTags('ai')
@ApiBearerAuth()
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summarize')
  @UseGuards(OptionalJwtAuthGuard)
  async summarize(@Body() body: SummarizeBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    const style: SummaryStyle = body.style === 'bullets' ? 'bullets' : 'executive';
    const length: SummaryLength =
      body.length === 'short' || body.length === 'long' ? body.length : 'medium';

    try {
      const summary = await this.aiService.summarize(body.pages, style, length, user?.id);
      return { summary };
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not summarize this document.'
      );
    }
  }

  @Post('chat')
  @UseGuards(OptionalJwtAuthGuard)
  async chat(@Body() body: ChatBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    if (!body.question?.trim()) throw new BadRequestException('No question provided.');

    try {
      const answer = await this.aiService.chat(body.pages, body.history ?? [], body.question, user?.id);
      return { answer };
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not answer this question.'
      );
    }
  }

  @Post('analyze-clauses')
  @UseGuards(OptionalJwtAuthGuard)
  async analyzeClauses(@Body() body: AnalyzeClausesBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');

    try {
      const result = await this.aiService.analyzeClauses(body.pages, user?.id);
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not analyze this contract.'
      );
    }
  }

  @Post('extract-references')
  @UseGuards(OptionalJwtAuthGuard)
  async extractReferences(
    @Body() body: ExtractReferencesBody,
    @OptionalCurrentUser() user: SafeUser | null
  ) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    const format: ReferenceFormat =
      body.format === 'apa' || body.format === 'mla' ? body.format : 'bibtex';

    try {
      const references = await this.aiService.extractReferences(body.pages, format, user?.id);
      return { references };
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not extract references.'
      );
    }
  }

  @Post('extract-invoice')
  @UseGuards(OptionalJwtAuthGuard)
  async extractInvoice(@Body() body: ExtractInvoiceBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');

    try {
      const result = await this.aiService.extractInvoiceData(body.pages, user?.id);
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not extract invoice data.'
      );
    }
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async activity(@CurrentUser() user: SafeUser) {
    return this.aiService.getActivity(user.id);
  }
}
