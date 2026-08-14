import { BadRequestException, Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
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

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summarize')
  async summarize(@Body() body: SummarizeBody) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    const style: SummaryStyle = body.style === 'bullets' ? 'bullets' : 'executive';
    const length: SummaryLength =
      body.length === 'short' || body.length === 'long' ? body.length : 'medium';

    try {
      const summary = await this.aiService.summarize(body.pages, style, length);
      return { summary };
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not summarize this document.'
      );
    }
  }

  @Post('chat')
  async chat(@Body() body: ChatBody) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    if (!body.question?.trim()) throw new BadRequestException('No question provided.');

    try {
      const answer = await this.aiService.chat(body.pages, body.history ?? [], body.question);
      return { answer };
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not answer this question.'
      );
    }
  }

  @Post('analyze-clauses')
  async analyzeClauses(@Body() body: AnalyzeClausesBody) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');

    try {
      const result = await this.aiService.analyzeClauses(body.pages);
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not analyze this contract.'
      );
    }
  }

  @Post('extract-references')
  async extractReferences(@Body() body: ExtractReferencesBody) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    const format: ReferenceFormat =
      body.format === 'apa' || body.format === 'mla' ? body.format : 'bibtex';

    try {
      const references = await this.aiService.extractReferences(body.pages, format);
      return { references };
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not extract references.'
      );
    }
  }

  @Post('extract-invoice')
  async extractInvoice(@Body() body: ExtractInvoiceBody) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');

    try {
      const result = await this.aiService.extractInvoiceData(body.pages);
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not extract invoice data.'
      );
    }
  }
}
