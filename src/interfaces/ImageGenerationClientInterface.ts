import type { GeneratedImageResultInterface } from './GeneratedImageResultInterface';

export interface ImageGenerationClientInterface {
  generateImage(prompt: string): Promise<GeneratedImageResultInterface>;
}
