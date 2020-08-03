import { Controller, Get, Param, Query, UseGuards, UnauthorizedException,ParseBoolPipe } from '@nestjs/common';
import { ImageResizerService } from './image-resizer.service';
import { ApiOperation, ApiBearerAuth, ApiBody, ApiBasicAuth } from '@nestjs/swagger';
import * as path from 'path';
import * as fs from 'fs-extra';
import { AuthGuard } from '@nestjs/passport';
import { readdirRec } from '../lib/readdirRec';

@Controller('image-resizer')
export class ImageResizerController {

    constructor(
        private imgResizerService: ImageResizerService
    ) { }
    @ApiBasicAuth('login')
    @UseGuards(AuthGuard('basic'))
    @Get('resizeAll')
    @ApiOperation({ summary: 'Resize all images', tags: ['image-resize'], description: 'Resize all images of input directory and put the result in output directory according to the tree view of json files' })
    async resizeAllImages() {
        try {

            this.imgResizerService.resizeDir(process.env.INPUT_DIR, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
            return 'All images has been resized';
        } catch (err) {
            throw err;
        }
    }
    @ApiBasicAuth('login')
    @UseGuards(AuthGuard('basic'))
    @Get('resizeOneImage/:imageName')
    @ApiOperation({ summary: 'Resize one image', tags: ['image-resize'], description: 'Resize one image of input directory and put the result in output directory according to the tree view of json files' })
    async resizeOne(@Param('imageName') imageName: string) {
        // console.log(process.env.INPUT_DIR, process.env.OUTPUT_DIR);

        const imagePath = path.join(process.env.INPUT_DIR, imageName);
        if (fs.existsSync(imagePath)) {
            await this.imgResizerService.resizeOneImage(imagePath, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
            return `Image ${imageName} has been resized`;
        } else {
            return { statusCode: 404, message: 'Input image does not exist' };
        }

    }

    @ApiBasicAuth('login')
    @UseGuards(AuthGuard('basic'))
    @Get('removeAll')
    @ApiOperation({ summary: 'Remove all images', tags: ['image-resize'], description: 'Remove all images in outputDir' })
    async removeAll() {
        try {
            this.imgResizerService.removeAll(process.env.OUTPUT_DIR);
            return 'Files in ' + process.env.OUTPUT_DIR + ' have been removed';
        } catch (err) {
            throw err;
        }
    }

    @ApiBasicAuth('login')
    @UseGuards(AuthGuard('basic'))
    @ApiOperation({ summary: 'Resize content of one directory', tags: ['image-resize'], description: 'Resize content of a directory of input directory and put the result in output directory according to the tree view of json files' })
    @Get('resizeDir/:dirName')
    async resizeDir(@Param('dirName') dirName: string) {

        const dirPath = path.join(process.env.INPUT_DIR, dirName);
        if (fs.existsSync(dirPath)) {
            this.imgResizerService.resizeDir(dirPath, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
            return `Content of directory ${dirPath} has been resized`;
        } else {
            return { statusCode: 404, message: 'Input directory does not exist' };
        }

    }
    @ApiBasicAuth('login')
    @UseGuards(AuthGuard('basic'))
    @ApiOperation({ summary: 'Remove one image', tags: ['image-resize'], description: 'Remove image in input directory and files created in the output directory' })
    @Get('removeOneImage/:imageName')
    async removeOneImage(@Param('imageName') imageName: string, @Query('removeOriginal',ParseBoolPipe) removeOriginal: boolean) {
        let returnString = `Image ${imageName} has been removed in ${process.env.OUTPUT_DIR} directory`;
        const imagePath = path.join(process.env.INPUT_DIR, imageName);
        const imagesInput = readdirRec(process.env.INPUT_DIR);
        if (!imagesInput.find(image => imagePath === image)) {
            throw new UnauthorizedException('You cannot delete files that are not in inputDir');
        }
        if (imageName.match('.*\.json') || path.basename(imageName).match('.*\.gitignore$')) {
            throw new UnauthorizedException('You cannot delete .json or .gitignore file with this command');
        }
        if (removeOriginal && fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            returnString += `Image ${imageName} has been removed in ${process.env.INPUT_DIR} directory`;
        }
        this.imgResizerService.removeOneImage(imagePath, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
        return `Image ${imageName} has been removed in ${process.env.OUTPUT_DIR} directory`;
    }
    @ApiBasicAuth('login')
    @UseGuards(AuthGuard('basic'))
    @ApiOperation({ summary: 'Remove one directory', tags: ['image-resize'], description: 'Remove directory in input directory and files created in output directory' })
    @Get('removeDir/:dirName')
    async removeDir(@Param('dirName') dirName: string, @Query('removeOriginal',ParseBoolPipe) removeOriginal: boolean) {
        let returnString = `Directory ${dirName} has been removed in ${process.env.OUTPUT_DIR}`;
        const dirsInput = readdirRec(process.env.INPUT_DIR, true);
        const dirPath = path.join(process.env.INPUT_DIR, dirName);

        if (!dirsInput.find(dir => dir === dirPath)) {
            throw new UnauthorizedException('You cannot modify folders that are not in inputDir');
        }
        await this.imgResizerService.removeDir(dirPath, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
        if (removeOriginal && fs.existsSync(dirPath)) {
            await fs.remove(dirPath);
            returnString += `\nDirectory ${dirName} has been removed in ${process.env.INPUT_DIR}`;
        }
        return returnString;

    }
    @ApiBasicAuth('login')
    @UseGuards(AuthGuard('basic'))
    @ApiOperation({ summary: 'Search images', tags: ['image-resize'], description: 'Search images in inputDirectory and OutputDirectory' })
    @Get('searchImg')
    async searchImages(@Query('regex') regex: string): Promise<any> {
        return await this.imgResizerService.searchImages(regex, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
    }

}
