import { ImagineImageFactory } from "@factories/ImagineImageFactory";
import { ImagineImage } from "@models/ImagineImage";

export class CardImagine extends ImagineImageFactory {
  protected prompt?: string;
  private imagineImage: ImagineImage;
  private used: boolean;

  constructor(prompt?: string) {
    super();
    this.prompt = prompt;
    this.used = false;
    // Initialize with a placeholder image; image generation is driven externally
    this.imagineImage = new ImagineImage("../assets/dixitcarte.jpg");
  }

  public createCardImagine(prompt?: string): CardImagine {
    return new CardImagine(prompt);
  }

  public getImage(): ImagineImage {
    return this.imagineImage;
  }

  public isUsed(): boolean {
    return this.used;
  }

  public setUsed(value: boolean) {
    this.used = value;
  }
}