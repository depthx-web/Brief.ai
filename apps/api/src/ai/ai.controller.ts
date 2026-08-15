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
import { FeatureGuard } from '../features/feature.guard';
import { RequireFeature } from '../features/require-feature.decorator';
import { AiService, ChatMessage, PageText, ReferenceFormat, SummaryLength, SummaryStyle } from './ai.service';

interface SummarizeBody {
  pages?: PageText[];
  style?: string;
  length?: string;
  docType?: string;
}

interface ChatBody {
  pages?: PageText[];
  history?: ChatMessage[];
  question?: string;
  docType?: string;
}

interface AnalyzeClausesBody {
  pages?: PageText[];
  docType?: string;
}

interface ExtractReferencesBody {
  pages?: PageText[];
  format?: string;
  docType?: string;
}

interface ExtractInvoiceBody {
  pages?: PageText[];
  docType?: string;
}

interface CompareBody {
  pagesA?: PageText[];
  pagesB?: PageText[];
  docType?: string;
}

interface SinglePagesBody {
  pages?: PageText[];
  docType?: string;
}

interface ReconcileBankBody {
  pagesBank?: PageText[];
  pagesRecords?: PageText[];
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
  @RequireFeature('SUMMARIZE')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async summarize(@Body() body: SummarizeBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    const style: SummaryStyle = body.style === 'bullets' ? 'bullets' : 'executive';
    const length: SummaryLength =
      body.length === 'short' || body.length === 'long' ? body.length : 'medium';

    try {
      const summary = await this.aiService.summarize(body.pages, style, length, user?.id, body.docType);
      return { summary };
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not summarize this document.'
      );
    }
  }

  @Post('chat')
  @RequireFeature('CHAT')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async chat(@Body() body: ChatBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    if (!body.question?.trim()) throw new BadRequestException('No question provided.');

    try {
      return await this.aiService.chat(body.pages, body.history ?? [], body.question, user?.id, body.docType);
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not answer this question.'
      );
    }
  }

  @Post('analyze-clauses')
  @RequireFeature('ANALYZE_CLAUSES')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async analyzeClauses(@Body() body: AnalyzeClausesBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');

    try {
      const result = await this.aiService.analyzeClauses(body.pages, user?.id, body.docType);
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not analyze this contract.'
      );
    }
  }

  @Post('extract-references')
  @RequireFeature('EXTRACT_REFERENCES')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async extractReferences(
    @Body() body: ExtractReferencesBody,
    @OptionalCurrentUser() user: SafeUser | null
  ) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    const format: ReferenceFormat =
      body.format === 'apa' || body.format === 'mla' ? body.format : 'bibtex';

    try {
      const references = await this.aiService.extractReferences(body.pages, format, user?.id, body.docType);
      return { references };
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not extract references.'
      );
    }
  }

  @Post('extract-invoice')
  @RequireFeature('EXTRACT_INVOICE')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async extractInvoice(@Body() body: ExtractInvoiceBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');

    try {
      const result = await this.aiService.extractInvoiceData(body.pages, user?.id, body.docType);
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Could not extract invoice data.'
      );
    }
  }

  @Post('compare-contracts')
  @RequireFeature('COMPARE_CONTRACTS')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async compareContracts(@Body() body: CompareBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pagesA?.length || !body.pagesB?.length) throw new BadRequestException('Two documents are required.');
    try {
      return await this.aiService.compareContracts(body.pagesA, body.pagesB, user?.id, body.docType);
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not compare these contracts.');
    }
  }

  @Post('summarize-plain')
  @RequireFeature('SUMMARIZE_PLAIN')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async summarizePlain(@Body() body: SinglePagesBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    try {
      const summary = await this.aiService.summarizePlain(body.pages, user?.id, body.docType);
      return { summary };
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not summarize this document.');
    }
  }

  @Post('audit-nda')
  @RequireFeature('AUDIT_NDA')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async auditNda(@Body() body: SinglePagesBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    try {
      return await this.aiService.auditNda(body.pages, user?.id);
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not audit this NDA.');
    }
  }

  @Post('detect-sensitive-data')
  @RequireFeature('DETECT_SENSITIVE_DATA')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async detectSensitiveData(@Body() body: SinglePagesBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    try {
      return await this.aiService.detectSensitiveData(body.pages, user?.id);
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not scan this document.');
    }
  }

  @Post('analyze-financial-ratios')
  @RequireFeature('ANALYZE_FINANCIAL_RATIOS')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async analyzeFinancialRatios(@Body() body: SinglePagesBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    try {
      return await this.aiService.analyzeFinancialRatios(body.pages, user?.id);
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not analyze this statement.');
    }
  }

  @Post('reconcile-bank')
  @RequireFeature('RECONCILE_BANK')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async reconcileBank(@Body() body: ReconcileBankBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pagesBank?.length || !body.pagesRecords?.length) {
      throw new BadRequestException('Both a bank statement and recorded invoices are required.');
    }
    try {
      return await this.aiService.reconcileBank(body.pagesBank, body.pagesRecords, user?.id);
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not reconcile these records.');
    }
  }

  @Post('flag-deductible-expenses')
  @RequireFeature('FLAG_DEDUCTIBLE_EXPENSES')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async flagDeductibleExpenses(@Body() body: SinglePagesBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    try {
      return await this.aiService.flagDeductibleExpenses(body.pages, user?.id);
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not flag expenses.');
    }
  }

  @Post('detect-duplicate-payments')
  @RequireFeature('DETECT_DUPLICATE_PAYMENTS')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async detectDuplicatePayments(@Body() body: SinglePagesBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    try {
      return await this.aiService.detectDuplicatePayments(body.pages, user?.id);
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not scan for duplicates.');
    }
  }

  @Post('compare-papers')
  @RequireFeature('COMPARE_PAPERS')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async comparePapers(@Body() body: CompareBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pagesA?.length || !body.pagesB?.length) throw new BadRequestException('Two papers are required.');
    try {
      return await this.aiService.comparePapers(body.pagesA, body.pagesB, user?.id);
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not compare these papers.');
    }
  }

  @Post('extract-methodology')
  @RequireFeature('EXTRACT_METHODOLOGY')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async extractMethodology(@Body() body: SinglePagesBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    try {
      return await this.aiService.extractMethodology(body.pages, user?.id);
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not extract methodology.');
    }
  }

  @Post('generate-outline')
  @RequireFeature('GENERATE_OUTLINE')
  @UseGuards(OptionalJwtAuthGuard, FeatureGuard)
  async generateOutline(@Body() body: SinglePagesBody, @OptionalCurrentUser() user: SafeUser | null) {
    if (!body.pages?.length) throw new BadRequestException('No document text provided.');
    try {
      const outline = await this.aiService.generateOutline(body.pages, user?.id);
      return { outline };
    } catch (err) {
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Could not generate an outline.');
    }
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async activity(@CurrentUser() user: SafeUser) {
    return this.aiService.getActivity(user.id);
  }
}
