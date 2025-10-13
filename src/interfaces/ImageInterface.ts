
export interface ImageInterface {
    createdAt: Date;
    updatedAt: Date;
    path: string;
    width: number;
    height: number;

    render(): ImageInterface;
}