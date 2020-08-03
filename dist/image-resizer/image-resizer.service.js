"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageResizerService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs-extra");
const sharp = require("sharp");
const path = require("path");
const chokidar = require("chokidar");
const readdirRec_1 = require("../lib/readdirRec");
const white = '\x1b[0m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
let ImageResizerService = (() => {
    let ImageResizerService = class ImageResizerService {
        async resize(imagePath, fileOut, opt, imgQuality) {
            try {
                const extOut = path.parse(fileOut).ext.substring(1);
                const optionsResize = {
                    width: opt.outputSize.width,
                    height: opt.outputSize.height,
                    fit: 'outside',
                };
                const { data, info } = await sharp(imagePath)
                    .resize(optionsResize)
                    .toBuffer({ resolveWithObject: true });
                const imgResized = sharp(data);
                const imgResizedWidth = info.width;
                const imgResizedHeight = info.height;
                const _top = Math.round((imgResizedHeight - opt.outputSize.height) * (0.5 - opt.translate.y));
                const _left = Math.round((imgResizedWidth - opt.outputSize.width) * (0.5 - opt.translate.x));
                const extractOptions = {
                    width: opt.outputSize.width,
                    height: opt.outputSize.height,
                    top: _top,
                    left: _left,
                };
                if (!opt.outputSize.width || !opt.outputSize.height) {
                    await imgResized.toFormat(extOut, { quality: imgQuality }).toFile(path.join(fileOut));
                }
                else {
                    await imgResized
                        .extract(extractOptions)
                        .toFormat(extOut, { quality: imgQuality })
                        .toFile(path.join(fileOut));
                }
                console.log('Image', imagePath, ' has been resized');
            }
            catch (err) {
                process.stdout.write(red);
                console.error(err.stack);
                process.stdout.write(white);
            }
        }
        imageWatcher(inputDir, outputDir, enableRemove = true) {
            const defaultConfigPath = path.join(inputDir, 'default.json');
            if (!fs.existsSync(defaultConfigPath)) {
                throw new Error('Error: No default.json file in input folder');
            }
            common_1.Logger.log('ImageWatcher has been launched', 'ImageWatcher', false);
            common_1.Logger.log('inputDir = ' + inputDir, 'Image Watcher');
            common_1.Logger.log('outputDir = ' + outputDir, 'ImageWatcher');
            if (!fs.existsSync(inputDir)) {
                common_1.Logger.log('inputDir not found !');
            }
            if (!fs.existsSync(outputDir)) {
                common_1.Logger.log('outputDir not found !');
            }
            const imageWatcher = chokidar.watch(inputDir, { ignoreInitial: true, usePolling: true, interval: 300 });
            imageWatcher
                .on('addDir', (dir) => {
                const baseDir = path.basename(dir);
                console.log('Directory', baseDir, 'has been added');
            })
                .on('add', async (file) => {
                if (!file.endsWith('.json')) {
                    console.log('File', file, 'has been added');
                    await this.resizeOneImage(file, inputDir, outputDir);
                }
            })
                .on('error', (err) => {
                process.stdout.write(red);
                console.error(err);
                process.stdout.write(white);
            });
            if (enableRemove) {
                imageWatcher
                    .on('unlink', async (file) => {
                    console.log('File', file, 'has been removed');
                    this.removeOneImage(file, inputDir, outputDir);
                })
                    .on('unlinkDir', (dir) => {
                    console.log('Directory', path.basename(dir), 'has been added');
                    this.removeAll(outputDir);
                    this.resizeDir(inputDir, inputDir, outputDir);
                });
            }
        }
        async resizeOneImage(file, inputDir, outputDir) {
            const base = path.basename(file);
            const ext = path.parse(file).ext;
            try {
                const config = this.getConfig(inputDir, file);
                for (const size in config) {
                    if (config.hasOwnProperty(size)) {
                        const opt = config[size];
                        if (opt.allowedExt.includes(ext.substring(1))) {
                            let dirResize = path.dirname(file.replace(inputDir, path.join(outputDir, size)));
                            if (!opt.outputSize.width || !opt.outputSize.height) {
                                dirResize = dirResize.replace(outputDir, path.join(outputDir, 'resized'));
                            }
                            opt.outOptions.forEach(async (outOption) => {
                                let extOut = outOption.ext ? outOption.ext : ext.substring(1);
                                extOut = extOut === 'jpeg' ? 'jpg' : extOut;
                                const quality = outOption.quality ? outOption.quality : 80;
                                const baseOut = base.replace(ext, '.' + extOut);
                                await fs.ensureDir(dirResize);
                                await this.resize(file, path.join(dirResize, baseOut), opt, quality);
                                console.log('File', base, 'has been created in', path.join(dirResize, baseOut));
                            });
                        }
                        else {
                            const err = new Error('File extension is not included in json file !');
                            process.stdout.write(red);
                            console.error(err.stack);
                            process.stdout.write(white);
                        }
                    }
                }
            }
            catch (err) {
                process.stdout.write(red);
                console.error(err.stack);
                process.stdout.write(white);
            }
        }
        resizeDir(dir, inputDir, outputDir) {
            const files = readdirRec_1.readdirRec(dir);
            files.forEach(async (file) => {
                if (!file.endsWith('.json') && !file.endsWith('.gitignore')) {
                    this.resizeOneImage(file, inputDir, outputDir);
                }
            });
        }
        removeOneImage(file, inputDir, outputDir) {
            const base = path.basename(file);
            const ext = path.parse(file).ext;
            const config = this.getConfig(inputDir, file);
            for (const size in config) {
                if (config.hasOwnProperty(size)) {
                    const opt = config[size];
                    opt.outOptions.forEach((outOption) => {
                        let extResized = outOption.ext ? outOption.ext : ext.substring(1);
                        extResized = extResized === 'jpeg' ? 'jpg' : extResized;
                        let fileResize = file
                            .replace(inputDir, path.join(outputDir, size))
                            .replace(ext, '.' + extResized);
                        if (!opt.outputSize.width || !opt.outputSize.height) {
                            fileResize = fileResize.replace(outputDir, path.join(outputDir, 'resized'));
                        }
                        console.log(fileResize);
                        if (fs.existsSync(fileResize)) {
                            try {
                                fs.unlinkSync(fileResize);
                                console.log('File', base, 'has been removed of', path.dirname(fileResize));
                            }
                            catch (err) {
                                process.stdout.write(red);
                                console.error(err.stack);
                                process.stdout.write(white);
                            }
                        }
                        if (fs.existsSync(path.parse(fileResize).dir) && fs.readdirSync(path.parse(fileResize).dir).length === 0) {
                            fs.removeSync(path.parse(fileResize).dir);
                            console.log('Directory ', path.dirname(fileResize), 'has been removed');
                        }
                        if (fs.existsSync(path.join(outputDir, size)) && fs.readdirSync(path.join(outputDir, size)).length === 0) {
                            fs.removeSync(path.join(outputDir, size));
                            console.log('Directory', size, 'has been removed of', outputDir);
                        }
                        if (fs.existsSync(path.join(outputDir, 'resized', size)) && fs.readdirSync(path.join(outputDir, 'resized', size)).length === 0) {
                            fs.removeSync(path.join(outputDir, 'resized', size));
                            console.log('Directory', path.join('resized', size), 'has been removed of', outputDir);
                        }
                        if (fs.existsSync(path.join(outputDir, 'resized')) && fs.readdirSync(path.join(outputDir, 'resized')).length === 0) {
                            fs.removeSync(path.join(outputDir, 'resized'));
                            console.log('Directory resized has been removed of', outputDir);
                        }
                    });
                }
            }
        }
        async removeDir(dir, inputDir, outputDir) {
            const defaultConfigPath = path.join(inputDir, 'default.json');
            const baseDir = path.basename(dir);
            console.log('Directory', baseDir, 'has been removed');
            const defaultConfig = fs.readJSONSync(defaultConfigPath);
            if (fs.existsSync(dir)) {
                const files = readdirRec_1.readdirRec(dir);
                files.forEach(async (file) => {
                    try {
                        this.removeOneImage(file, inputDir, outputDir);
                    }
                    catch (err) {
                        process.stdout.write(red);
                        console.error(err.stack);
                        process.stdout.write(white);
                    }
                });
            }
            console.log('Directory', dir, 'has been removed of', outputDir);
        }
        async configWatcher(inputDir, outputDir) {
            common_1.Logger.log('ConfigWatcher has been launched', 'ConfigWatcher', false);
            const configWatcher = chokidar.watch(inputDir, { ignoreInitial: true, usePolling: true, interval: 300 });
            configWatcher.on('all', async (event, cfgFile) => {
                if (cfgFile.endsWith('.json') &&
                    (event === 'add' || event === 'change')) {
                    if (event === 'add' || event === 'change') {
                        const cfgBase = path.basename(cfgFile);
                        const cfgName = path.parse(cfgFile).name;
                        const dir = path.dirname(cfgFile);
                        console.log('Config file', cfgBase, 'has been', event === 'add' ? event + 'ed' : event + 'd');
                        if (cfgBase === 'default.json') {
                            this.removeAll(outputDir);
                            this.resizeDir(inputDir, inputDir, outputDir);
                        }
                        else {
                            const files = readdirRec_1.readdirRec(dir);
                            const imagePath = files.filter((file) => file.match(`${cfgName}(?!.*\.json)`))[0];
                            if (fs.existsSync(imagePath)) {
                                this.resizeOneImage(imagePath, inputDir, outputDir);
                            }
                        }
                    }
                }
                if (cfgFile.endsWith('.json') && event === 'unlink') {
                    const cfgBase = path.basename(cfgFile);
                    const cfgName = path.parse(cfgFile).name;
                    const dir = path.parse(cfgFile).dir;
                    if (cfgBase === 'default.json') {
                        if (fs.existsSync(dir)) {
                            this.removeAll(outputDir);
                            this.resizeDir(dir, inputDir, outputDir);
                        }
                    }
                    else {
                        if (fs.existsSync(dir)) {
                            const filesToResize = fs.readdirSync(dir).filter((file) => file.match(path.join(dir, cfgName + '\..*')));
                            if (filesToResize.length) {
                                this.resizeOneImage(filesToResize[0], inputDir, outputDir);
                            }
                        }
                    }
                }
            });
        }
        async searchImages(regex, inputDir, outputDir) {
            const imgList = readdirRec_1.readdirRec(process.env.INPUT_DIR).filter((img) => path.basename(img).match(regex) &&
                !path.basename(img).match('.*.json$') &&
                !path.basename(img).match('.*.gitignore$'));
            const out = [];
            imgList.forEach((file) => {
                const defaultConfigPath = path.join(inputDir, 'default.json');
                const dir = path.dirname(file);
                const ext = path.parse(file).ext;
                const name = path.parse(file).name;
                const config = this.getConfig(inputDir, file);
                const imgResized = [];
                for (const size in config) {
                    if (config.hasOwnProperty(size)) {
                        const opt = config[size];
                        opt.outOptions.forEach((outOption) => {
                            let extResized = outOption.ext ? outOption.ext : ext.substring(1);
                            extResized = extResized === 'jpeg' ? 'jpg' : extResized;
                            let fileResize = file
                                .replace(inputDir, path.join(outputDir, size))
                                .replace(ext, '.' + extResized);
                            if (fs.existsSync(fileResize)) {
                                imgResized.push(fileResize);
                            }
                            fileResize = fileResize.replace(outputDir, path.join(outputDir, 'resized'));
                            if (fs.existsSync(fileResize)) {
                                imgResized.push(fileResize);
                            }
                        });
                    }
                }
                out.push({ original: file, resized: imgResized });
            });
            return out;
        }
        getConfig(inputDir, file) {
            const name = path.parse(file).name;
            let dir = path.parse(file).dir;
            if (fs.existsSync(path.join(dir, name + '.json'))) {
                return fs.readJSONSync(path.join(dir, name + '.json'));
            }
            else {
                let searchConfigFile = true;
                while (searchConfigFile) {
                    if (fs.existsSync(path.join(dir, 'default.json'))) {
                        return fs.readJSONSync(path.join(dir, 'default.json'));
                    }
                    else {
                        dir = path.join(dir, '..');
                    }
                    if (path.resolve(dir) === inputDir) {
                        searchConfigFile = false;
                    }
                }
            }
        }
        removeAll(outputDir) {
            const filesToDelete = fs.readdirSync(outputDir).filter((file) => !file.endsWith('.gitignore'));
            filesToDelete.forEach((file) => {
                const filePath = path.join(outputDir, file);
                fs.removeSync(filePath);
                console.log(filePath, 'has been removed of', outputDir);
            });
        }
        async onApplicationBootstrap() {
            try {
                this.imageWatcher(process.env.INPUT_DIR, process.env.OUTPUT_DIR);
                await this.configWatcher(process.env.INPUT_DIR, process.env.OUTPUT_DIR);
            }
            catch (err) {
                process.stdout.write(red);
                console.error(err.stack);
                process.stdout.write(white);
                process.exit(1);
            }
        }
    };
    ImageResizerService = __decorate([
        common_1.Injectable()
    ], ImageResizerService);
    return ImageResizerService;
})();
exports.ImageResizerService = ImageResizerService;
//# sourceMappingURL=image-resizer.service.js.map