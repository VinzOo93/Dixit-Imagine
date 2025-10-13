import { ImageInterface } from "@interfaces/ImageInterface";

export class ImagineImage implements ImageInterface {


    createdAt: Date;
    updatedAt: Date;
    path: string;
    width: number;
    height: number;


    constructor(path: string) {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.path = path;
        this.width = 40;
        this.height = 50;
    }

    render(): ImageInterface {
        return this;
    }

}
