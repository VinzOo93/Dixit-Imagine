import { ImageGenerationClientInterface } from '@interfaces/ImageGenerationClientInterface';
import { GeneratedImageResultInterface } from '@interfaces/GeneratedImageResultInterface';
import Constants from 'expo-constants';

// Simple fetch-based client for Stability AI Image Generation API
// Expects STABILITY_API_KEY to be available at runtime.
export class StabilityAIImageClient implements ImageGenerationClientInterface {
  private apiKey: string | undefined;
  private endpoint: string;

  constructor(options?: { apiKey?: string; endpoint?: string }) {
    const fromConstants = (Constants as any)?.expoConfig?.extra?.STABILITY_API_KEY;
    this.apiKey = options?.apiKey ?? fromConstants ?? process.env.STABILITY_API_KEY;
    this.endpoint = options?.endpoint ?? 'https://api.stability.ai/v2beta/stable-image/generate/core';
  }

  async generateImage(prompt: string): Promise<GeneratedImageResultInterface> {
    if (!this.apiKey) {
      throw new Error('Missing STABILITY_API_KEY. Please set it in your environment configuration.');
    }

    // Build multipart form-data
    const formData = new FormData();
    formData.append('prompt', prompt);
    // Optional parameters. Adjust as needed.
    formData.append('output_format', 'png');
    // formData.append('aspect_ratio', '1:1');

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'image/*',
        // Note: Do NOT set Content-Type here; fetch will set it correctly for multipart FormData
      } as any,
      body: formData as any,
    });

    if (!res.ok) {
      const text = await safeReadText(res);
      throw new Error(`Stability API error (${res.status}): ${text}`);
    }

    // Response is binary image; read as base64
    const arrayBuffer = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    const dataUri = `data:image/png;base64,${base64}`;

    return { dataUri };
  }
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '<no-body>';
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  // Works in RN/JS by converting to binary string
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa is available in React Native via global atob/btoa polyfills. If missing, further polyfill may be needed.
  return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}
