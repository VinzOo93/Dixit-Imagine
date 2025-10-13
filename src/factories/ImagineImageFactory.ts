import {ImagineImage} from "@models/ImagineImage";
import {ImagineImageService} from "@services/ImagineImageService";

export class ImagineImageFactory {
  public async createImage(prompt?: string): Promise<ImagineImage> {
    const service = new ImagineImageService();
    const safePrompt = prompt ?? "Je suis une carte de jeu";
    // Use the generation service to obtain and persist the image, returning its file path
      return await service.generateFromPrompt(safePrompt);
  }
}

