"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageResizerController = void 0;
const common_1 = require("@nestjs/common");
const image_resizer_service_1 = require("./image-resizer.service");
const swagger_1 = require("@nestjs/swagger");
const path = require("path");
const fs = require("fs-extra");
const passport_1 = require("@nestjs/passport");
const readdirRec_1 = require("../lib/readdirRec");
let ImageResizerController = (() => {
    let ImageResizerController = class ImageResizerController {
        constructor(imgResizerService) {
            this.imgResizerService = imgResizerService;
        }
        async resizeAllImages() {
            try {
                this.imgResizerService.resizeDir(process.env.INPUT_DIR, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
                return 'All images has been resized';
            }
            catch (err) {
                throw err;
            }
        }
        async resizeOne(imageName) {
            const imagePath = path.join(process.env.INPUT_DIR, imageName);
            if (fs.existsSync(imagePath)) {
                await this.imgResizerService.resizeOneImage(imagePath, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
                return `Image ${imageName} has been resized`;
            }
            else {
                return { statusCode: 404, message: 'Input image does not exist' };
            }
        }
        async resizeDir(dirName) {
            const dirPath = path.join(process.env.INPUT_DIR, dirName);
            if (fs.existsSync(dirPath)) {
                this.imgResizerService.resizeDir(dirPath, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
                return `Content of directory ${dirPath} has been resized`;
            }
            else {
                return { statusCode: 404, message: 'Input directory does not exist' };
            }
        }
        async removeOneImage(imageName, removeOriginal) {
            let returnString = `Image ${imageName} has been removed in ${process.env.OUTPUT_DIR} directory`;
            const imagePath = path.join(process.env.INPUT_DIR, imageName);
            const imagesInput = readdirRec_1.readdirRec(process.env.INPUT_DIR);
            if (!imagesInput.find(image => imagePath === image)) {
                throw new common_1.UnauthorizedException('You cannot delete files that are not in inputDir');
            }
            if (imageName.match('.*\.json') || path.basename(imageName).match('.*\.gitignore$')) {
                throw new common_1.UnauthorizedException('You cannot delete .json or .gitignore file with this command');
            }
            if (removeOriginal === 'true' && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                returnString += `Image ${imageName} has been removed in ${process.env.INPUT_DIR} directory`;
            }
            await this.imgResizerService.removeOneImage(imagePath, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
            return `Image ${imageName} has been removed in ${process.env.OUTPUT_DIR} directory`;
        }
        async removeDir(dirName, removeOriginal) {
            let returnString = `Directory ${dirName} has been removed in ${process.env.OUTPUT_DIR}`;
            const dirsInput = readdirRec_1.readdirRec(process.env.INPUT_DIR, true);
            const dirPath = path.join(process.env.INPUT_DIR, dirName);
            if (!dirsInput.find(dir => dir === dirPath)) {
                throw new common_1.UnauthorizedException('You cannot modify folders that are not in inputDir');
            }
            await this.imgResizerService.removeDir(dirPath, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
            if (removeOriginal === 'true' && fs.existsSync(dirPath)) {
                await fs.remove(dirPath);
                returnString += `\nDirectory ${dirName} has been removed in ${process.env.INPUT_DIR}`;
            }
            return returnString;
        }
        async searchImages(regex) {
            return await this.imgResizerService.searchImages(regex, process.env.INPUT_DIR, process.env.OUTPUT_DIR);
        }
    };
    __decorate([
        swagger_1.ApiBasicAuth('login'),
        common_1.UseGuards(passport_1.AuthGuard('basic')),
        common_1.Get('resizeAll'),
        swagger_1.ApiOperation({ summary: 'Resize all images', tags: ['image-resize'], description: 'Resize all images of input directory and put the result in output directory according to the tree view of json files' }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], ImageResizerController.prototype, "resizeAllImages", null);
    __decorate([
        swagger_1.ApiBasicAuth('login'),
        common_1.UseGuards(passport_1.AuthGuard('basic')),
        common_1.Get('resizeOneImage/:imageName'),
        swagger_1.ApiOperation({ summary: 'Resize one image', tags: ['image-resize'], description: 'Resize one image of input directory and put the result in output directory according to the tree view of json files' }),
        __param(0, common_1.Param('imageName')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", Promise)
    ], ImageResizerController.prototype, "resizeOne", null);
    __decorate([
        swagger_1.ApiBasicAuth('login'),
        common_1.UseGuards(passport_1.AuthGuard('basic')),
        swagger_1.ApiOperation({ summary: 'Resize content of one directory', tags: ['image-resize'], description: 'Resize content of a directory of input directory and put the result in output directory according to the tree view of json files' }),
        common_1.Get('resizeDir/:dirName'),
        __param(0, common_1.Param('dirName')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", Promise)
    ], ImageResizerController.prototype, "resizeDir", null);
    __decorate([
        swagger_1.ApiBasicAuth('login'),
        common_1.UseGuards(passport_1.AuthGuard('basic')),
        swagger_1.ApiOperation({ summary: 'Remove one image', tags: ['image-resize'], description: 'Remove image in input directory and files created in the output directory' }),
        common_1.Get('removeOneImage/:imageName'),
        __param(0, common_1.Param('imageName')), __param(1, common_1.Query('removeOriginal')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String]),
        __metadata("design:returntype", Promise)
    ], ImageResizerController.prototype, "removeOneImage", null);
    __decorate([
        swagger_1.ApiBasicAuth('login'),
        common_1.UseGuards(passport_1.AuthGuard('basic')),
        swagger_1.ApiOperation({ summary: 'Remove one directory', tags: ['image-resize'], description: 'Remove directory in input directory and files created in output directory' }),
        common_1.Get('removeDir/:dirName'),
        __param(0, common_1.Param('dirName')), __param(1, common_1.Query('removeOriginal')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String]),
        __metadata("design:returntype", Promise)
    ], ImageResizerController.prototype, "removeDir", null);
    __decorate([
        swagger_1.ApiBasicAuth('login'),
        common_1.UseGuards(passport_1.AuthGuard('basic')),
        swagger_1.ApiOperation({ summary: 'Search images', tags: ['image-resize'], description: 'Search images in inputDirectory and OutputDirectory' }),
        common_1.Get('searchImg'),
        __param(0, common_1.Query('regex')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", Promise)
    ], ImageResizerController.prototype, "searchImages", null);
    ImageResizerController = __decorate([
        common_1.Controller('image-resizer'),
        __metadata("design:paramtypes", [image_resizer_service_1.ImageResizerService])
    ], ImageResizerController);
    return ImageResizerController;
})();
exports.ImageResizerController = ImageResizerController;
//# sourceMappingURL=image-resizer.controller.js.map