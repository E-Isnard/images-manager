import { OnApplicationBootstrap } from '@nestjs/common';
export declare class ImageResizerService implements OnApplicationBootstrap {
    private resize;
    imageWatcher(inputDir: string, outputDir: string, enableRemove?: boolean): void;
    resizeOneImage(file: string, inputDir: string, outputDir: string): Promise<void>;
    resizeDir(dir: string, inputDir: string, outputDir: string): void;
    removeOneImage(file: string, inputDir: string, outputDir: string): Promise<void>;
    removeDir(dir: string, inputDir: string, outputDir: string): Promise<void>;
    configWatcher(inputDir: string, outputDir: string): Promise<void>;
    searchImages(regex: string, inputDir: string, outputDir: string): Promise<any[]>;
    onApplicationBootstrap(): Promise<void>;
}
