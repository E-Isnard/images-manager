import { ImageResizerService } from './image-resizer.service';
export declare class ImageResizerController {
    private imgResizerService;
    constructor(imgResizerService: ImageResizerService);
    resizeAllImages(): Promise<string>;
    resizeOne(imageName: string): Promise<string | {
        statusCode: number;
        message: string;
    }>;
    removeAll(): Promise<string>;
    resizeDir(dirName: string): Promise<string | {
        statusCode: number;
        message: string;
    }>;
    removeOneImage(imageName: string, removeOriginal: boolean): Promise<string>;
    removeDir(dirName: string, removeOriginal: boolean): Promise<string>;
    searchImages(regex: string): Promise<any>;
}
