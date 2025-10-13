import { ImageGenerationClientInterface } from '@interfaces/ImageGenerationClientInterface';
import { GeneratedImageResultInterface } from '@interfaces/GeneratedImageResultInterface';
import { fal } from "@fal-ai/client";

// fal.ai image generation client using @fal-ai/client
// Convention: do not manage credentials here; rely on FAL_KEY configured at app startup.
// Uses subscribe pattern as per fal.ai API docs for consistent queue handling.
export class FalAIImageClient implements ImageGenerationClientInterface {
  private readonly model: string;

  constructor(options?: { model?: string }) {
    this.model = options?.model ?? 'fal-ai/flux/schnell';
  }

  async generateImage(prompt: string): Promise<GeneratedImageResultInterface> {
      const falKey = process.env.EXPO_PUBLIC_FAL_KEY;
      fal.config({
          credentials: falKey,
      });

    const result: any = await fal.subscribe(this.model, {
      input: {
        prompt,
      },
        logs: true,
        onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
                update.logs.map((log) => log.message).forEach(console.log);
            }
            },
    });

    if (!result.requestId) {
      // Provide more context to help debugging
      const shape = JSON.stringify(Object.keys(result || {}));
      throw new Error(`fal.ai did not return an image URL. Result keys: ${shape}`);
    }

    return { dataUri: result.data.images[0].url };
  }
}
