import { ImagineImage } from '@models/ImagineImage';
import { ImageGenerationClientInterface } from '@interfaces/ImageGenerationClientInterface';
import { FalAIImageClient } from './FalAIImageClient';
import * as FileSystem from 'expo-file-system';

export class ImagineImageService {
  private client: ImageGenerationClientInterface;

  constructor(client?: ImageGenerationClientInterface) {
    this.client = client ?? new FalAIImageClient();
  }

  async generateFromPrompt(prompt: string): Promise<ImagineImage> {
    const result = await this.client.generateImage(prompt);

    // Persist image into app sandbox under assets/generated
    const fileUri = await this.saveDataUriToAssets(result.dataUri, 'png');

    const image = new ImagineImage(prompt);
    image.path = fileUri; // file:// URI for RN Image {uri}
    return image;
  }

  private async ensureDir(dirUri: string) {
    const info = await FileSystem.getInfoAsync(dirUri);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    }
  }

  private async saveDataUriToAssets(dataUri: string, ext: 'png' | 'jpg' | 'jpeg' = 'png'): Promise<string> {
    // Extract base64 from data URI if present
    let base64: string;
    const commaIdx = dataUri.indexOf(',');
    if (dataUri.startsWith('data:') && commaIdx !== -1) {
      base64 = dataUri.slice(commaIdx + 1);
    } else {
      // If it's a remote URL, download then save
      const downloaded = await FileSystem.downloadAsync(
        dataUri,
        `${FileSystem.cacheDirectory}tmp-download-${Date.now()}.${ext}`
      );
      const fileContent = await FileSystem.readAsStringAsync(downloaded.uri, { encoding: FileSystem.EncodingType.Base64 });
      base64 = fileContent;
    }

    const folder = `${FileSystem.documentDirectory}assets/generated/`;
    await this.ensureDir(folder);
    const filename = `img-${Date.now()}.${ext}`;
    const fileUri = `${folder}${filename}`;

    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
    return fileUri;
  }
}
