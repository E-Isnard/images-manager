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
                await imgResized
                    .extract(extractOptions)
                    .toFormat(extOut, { quality: imgQuality })
                    .toFile(fileOut);
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
            common_1.Logger.log('imageWatcher', 'inputDir = ' + inputDir);
            common_1.Logger.log('imageWatcher', 'outputDir = ' + outputDir);
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
                const config = fs.readJSONSync(defaultConfigPath);
                for (const size in config) {
                    if (config.hasOwnProperty(size)) {
                        try {
                            const dirResized = dir.replace(inputDir, path.join(outputDir, size));
                            fs.mkdirp(dirResized);
                        }
                        catch (err) {
                            process.stdout.write(red);
                            console.error(err.stack);
                            process.stdout.write(white);
                        }
                        console.log('Directory', baseDir, 'has been created in', path.join(outputDir, size));
                    }
                }
            })
                .on('add', async (file) => {
                console.log('File', file, 'has been added');
                await this.resizeOneImage(file, inputDir, outputDir);
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
                    await this.removeOneImage(file, inputDir, outputDir);
                })
                    .on('unlinkDir', (dir) => {
                    console.log('Directory', path.basename(dir), 'has been added');
                    this.removeDir(dir, inputDir, outputDir);
                });
            }
        }
        async resizeOneImage(file, inputDir, outputDir) {
            const defaultConfigPath = path.join(inputDir, 'default.json');
            const dir = path.dirname(file);
            const base = path.basename(file);
            const name = path.parse(file).name;
            const ext = path.parse(file).ext;
            try {
                const config = fs.existsSync(path.join(dir, name + '.json'))
                    ? fs.readJSONSync(path.join(dir, name + '.json'))
                    : fs.readJSONSync(path.join(defaultConfigPath));
                for (const size in config) {
                    if (config.hasOwnProperty(size)) {
                        const opt = config[size];
                        if (opt.allowedExt.includes(ext.substring(1))) {
                            const dirResize = path.dirname(file.replace(inputDir, path.join(outputDir, size)));
                            fs.ensureDir(dirResize);
                            opt.outOptions.forEach(async (outOption) => {
                                let extOut = outOption.ext ? outOption.ext : ext.substring(1);
                                extOut = extOut === 'jpeg' ? 'jpg' : extOut;
                                const quality = outOption.quality ? outOption.quality : 80;
                                const baseOut = base.replace(ext, '.' + extOut);
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
                if (!file.match('.*.json')) {
                    this.resizeOneImage(file, inputDir, outputDir);
                }
            });
        }
        async removeOneImage(file, inputDir, outputDir) {
            const defaultConfigPath = path.join(inputDir, 'default.json');
            const dir = path.dirname(file);
            const base = path.basename(file);
            const ext = path.parse(file).ext;
            const name = path.parse(file).name;
            const config = fs.existsSync(path.join(dir, name + '.json'))
                ? fs.readJSONSync(path.join(dir, name + '.json'))
                : fs.readJSONSync(defaultConfigPath);
            for (const size in config) {
                if (config.hasOwnProperty(size)) {
                    const opt = config[size];
                    opt.outOptions.forEach((outOption) => {
                        let extResized = outOption.ext ? outOption.ext : ext.substring(1);
                        extResized = extResized === 'jpeg' ? 'jpg' : extResized;
                        const fileResize = file
                            .replace(inputDir, path.join(outputDir, size))
                            .replace(ext, '.' + extResized);
                        if (fs.existsSync(fileResize)) {
                            try {
                                fs.unlink(fileResize).then(() => console.log('File', base, 'has been removed of', path.dirname(fileResize)));
                            }
                            catch (err) {
                                process.stdout.write(red);
                                console.error(err.stack);
                                process.stdout.write(white);
                            }
                        }
                    });
                    if (fs.existsSync(path.join(outputDir, size)) &&
                        fs.readdirSync(path.join(outputDir, size)).length === 0) {
                        fs.rmdir(path.join(outputDir, size)).then(() => console.log('Directory', size, 'has been removed of', outputDir));
                    }
                }
            }
        }
        async removeDir(dir, inputDir, outputDir) {
            const defaultConfigPath = path.join(inputDir, 'default.json');
            const baseDir = path.basename(dir);
            console.log('Directory', baseDir, 'has been removed');
            const config = fs.readJSONSync(defaultConfigPath);
            for (const size in config) {
                if (config.hasOwnProperty(size)) {
                    const dirResized = dir.replace(inputDir, path.join(outputDir, size));
                    if (fs.existsSync(dirResized)) {
                        try {
                            fs.removeSync(dirResized);
                        }
                        catch (err) {
                            process.stdout.write(red);
                            console.error(err.stack);
                            process.stdout.write(white);
                        }
                        console.log('Directory', baseDir, 'has been removed in', path.join(outputDir, size));
                        if (fs.existsSync(path.join(outputDir, size)) &&
                            fs.readdirSync(path.join(outputDir, size)).length === 0) {
                            await fs.rmdir(path.join(outputDir, size));
                            console.log('Directory', size, 'has been removed of', outputDir);
                        }
                    }
                }
            }
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
                            this.resizeDir(inputDir, inputDir, outputDir);
                        }
                        else {
                            const files = await readdirRec_1.readdirRec(dir);
                            const imagePath = files.filter((file) => file.match(`${cfgName}(?!.*\.json)`))[0];
                            if (fs.existsSync(imagePath)) {
                                this.resizeOneImage(imagePath, inputDir, outputDir);
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
                const config = fs.existsSync(path.join(dir, name + '.json'))
                    ? fs.readJSONSync(path.join(dir, name + '.json'))
                    : fs.readJSONSync(defaultConfigPath);
                const imgResized = [];
                for (const size in config) {
                    if (config.hasOwnProperty(size)) {
                        const opt = config[size];
                        opt.outOptions.forEach((outOption) => {
                            let extResized = outOption.ext ? outOption.ext : ext.substring(1);
                            extResized = extResized === 'jpeg' ? 'jpg' : extResized;
                            const fileResize = file
                                .replace(inputDir, path.join(outputDir, size))
                                .replace(ext, '.' + extResized);
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