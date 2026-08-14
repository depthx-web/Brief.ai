import { Injectable, Logger } from '@nestjs/common';
import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';

// Runs entirely locally (ONNX, downloaded once from the Hugging Face Hub and
// cached) — no API key, no external account, no per-call cost. Chosen
// specifically because DeepSeek has no embeddings endpoint (confirmed via a
// live 404, not a balance error) and we didn't want to add a second external
// AI provider just for this.
const MODEL_NAME = 'onnx-community/all-MiniLM-L6-v2-ONNX';
const MAX_EMBED_CHARS = 4000;

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

  private getExtractor(): Promise<FeatureExtractionPipeline> {
    if (!this.extractorPromise) {
      this.logger.log('Loading local embedding model (first call only)...');
      this.extractorPromise = pipeline('feature-extraction', MODEL_NAME);
    }
    return this.extractorPromise;
  }

  async embed(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const truncated = text.slice(0, MAX_EMBED_CHARS);
    const output = await extractor(truncated, { pooling: 'mean', normalize: true });
    const [vector] = output.tolist() as number[][];
    return vector;
  }

  static cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
