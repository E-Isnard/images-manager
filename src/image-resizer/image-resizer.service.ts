import {
  Injectable,
  OnApplicationBootstrap,
  Logger,
  UseGuards,
} from '@nestjs/common';
import * as fs from 'fs-extra';
import * as sharp from 'sharp';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { readdirRec } from '../lib/readdirRec';
import { GroupedObservable } from 'rxjs';
const white = '\x1b[0m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
@Injectable()
export class ImageResizerService implements OnApplicationBootstrap {
  /**
   * Resize an image
   * @param imagePath
   * @param fileOut
   * @param opt
   * @param imgQuality
   */
  private async resize(
    imagePath: string,
    fileOut: string,
    opt: {
      outputSize: { width: number; height: number };
      translate: { x: number; y: number };
    },
    imgQuality: number
  ): Promise<void> {
    try {
      const extOut = path.parse(fileOut).ext.substring(1);
      const optionsResize = {
        width: opt.outputSize.width,
        height: opt.outputSize.height,
        fit: 'outside',
      } as sharp.ResizeOptions;
      const { data, info } = await sharp(imagePath)
        .resize(optionsResize)
        .toBuffer({ resolveWithObject: true });

      const imgResized = sharp(data);
      const imgResizedWidth = info.width;
      const imgResizedHeight = info.height;

      const _top = Math.round(
        (imgResizedHeight - opt.outputSize.height) * (0.5 - opt.translate.y)
      );
      const _left = Math.round(
        (imgResizedWidth - opt.outputSize.width) * (0.5 - opt.translate.x)
      );
      const extractOptions = {
        width: opt.outputSize.width,
        height: opt.outputSize.height,
        top: _top,
        left: _left,
      };
      if (!opt.outputSize.width || !opt.outputSize.height) {
        await imgResized.toFormat(extOut, { quality: imgQuality }).toFile(path.join(fileOut));
      } else {
        await imgResized
          .extract(extractOptions)
          .toFormat(extOut, { quality: imgQuality })
          .toFile(path.join(fileOut));

      }
      console.log('Image', imagePath, ' has been resized');
    } catch (err) {
      process.stdout.write(red);
      console.error(err.stack);
      process.stdout.write(white);
    }
  }

  // ! Needed to use chokidar@2 due to a bug so it won't work on nodeJs 14 (https://github.com/paulmillr/chokidar/issues/917)
  // ! If you use chokidar@3 when you remove a folder and put it again in inputDir files inside the folder don't longer trigger the add event
  /**
   * Watcher for images.It automatically resizes images that are added in inputDir.
   * @param inputDir
   * @param outputDir
   * @param enableRemove
   */
  imageWatcher(inputDir: string, outputDir: string, enableRemove = true): void {
    const defaultConfigPath = path.join(inputDir, 'default.json');
    if (!fs.existsSync(defaultConfigPath)) {
      throw new Error('Error: No default.json file in input folder');
    }
    Logger.log('ImageWatcher has been launched', 'ImageWatcher', false);

    Logger.log('inputDir = ' + inputDir, 'Image Watcher');
    Logger.log('outputDir = ' + outputDir, 'ImageWatcher');

    if (!fs.existsSync(inputDir)) {
      Logger.log('inputDir not found !');
    }
    if (!fs.existsSync(outputDir)) {
      Logger.log('outputDir not found !');
    }

    const imageWatcher = chokidar.watch(inputDir, { ignoreInitial: true, usePolling: true, interval: 300 });
    imageWatcher

      .on('addDir', (dir: string) => {
        const baseDir = path.basename(dir);

        console.log('Directory', baseDir, 'has been added');
        // const config = fs.readJSONSync(defaultConfigPath);

        // for (const size in config) {
        //   if (config.hasOwnProperty(size)) {
        //     try {
        //       const dirResized = dir.replace(
        //         inputDir,
        //         path.join(outputDir, size)
        //       );
        //       fs.mkdirp(dirResized);
        //     } catch (err) {
        //       process.stdout.write(red);
        //       console.error(err.stack);
        //       process.stdout.write(white);
        //     console.log(
        //       'Directory',
        //       baseDir,
        //       'has been created in',
        //       path.join(outputDir, size)
        //     );
        //   }
        // }
      })

      .on('add', async (file: string) => {

        if (!file.endsWith('.json')) {
          console.log('File', file, 'has been added');
          await this.resizeOneImage(file, inputDir, outputDir);
        }

      })
      .on('error', (err: { stack: string }) => {
        process.stdout.write(red);
        console.error(err);
        process.stdout.write(white);
      });

    if (enableRemove) {
      imageWatcher
        .on('unlink', async (file: string) => {
          console.log('File', file, 'has been removed');
          this.removeOneImage(file, inputDir, outputDir);
        })
        .on('unlinkDir', (dir: string) => {
          console.log('Directory', path.basename(dir), 'has been added');
          this.removeAll(outputDir);
          this.resizeDir(inputDir, inputDir, outputDir);
        });
    }
  }

  /**
   * Resize the image with `file` as path and put them in outputDir
   * @param file
   * @param inputDir
   * @param outputDir
   */
  async resizeOneImage(
    file: string,
    inputDir: string,
    outputDir: string
  ): Promise<void> {
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
              // console.log(opt.outputSize);
              dirResize = dirResize.replace(outputDir, path.join(outputDir, 'resized'));
            }
            // fs.ensureDir(dirResize);
            opt.outOptions.forEach(
              async (outOption: { ext: string; quality: number }) => {
                let extOut = outOption.ext ? outOption.ext : ext.substring(1);
                extOut = extOut === 'jpeg' ? 'jpg' : extOut;
                const quality = outOption.quality ? outOption.quality : 80;
                const baseOut = base.replace(ext, '.' + extOut);

                // console.log(dirResize);
                await fs.ensureDir(dirResize);
                await this.resize(
                  file,
                  path.join(dirResize, baseOut),
                  opt,
                  quality
                );
                console.log(
                  'File',
                  base,
                  'has been created in',
                  path.join(dirResize, baseOut)
                );
              }
            );
          } else {
            const err = new Error(
              'File extension is not included in json file !'
            );
            process.stdout.write(red);
            console.error(err.stack);
            process.stdout.write(white);
          }
        }
      }
    } catch (err) {
      process.stdout.write(red);
      // console.log(file);
      console.error(err.stack);
      process.stdout.write(white);
    }
  }
  /**
   * Resize all images in dir
   * @param dir
   * @param inputDir
   * @param outputDir
   */
  resizeDir(dir: string, inputDir: string, outputDir: string): void {
    const files = readdirRec(dir);
    // console.log(files);

    files.forEach(async (file: string) => {
      if (!file.endsWith('.json') && !file.endsWith('.gitignore')) {
        this.resizeOneImage(file, inputDir, outputDir);
      }
    });
  }
  /**
   * Remove resized images of file
   * @param file
   * @param inputDir
   * @param outputDir
   */
  removeOneImage(file: string, inputDir: string, outputDir: string) {
    const base = path.basename(file);
    const ext = path.parse(file).ext;

    const config = this.getConfig(inputDir, file);
    for (const size in config) {
      if (config.hasOwnProperty(size)) {
        const opt = config[size];
        opt.outOptions.forEach(
          (outOption: { ext: string; quality: number }) => {
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
              } catch (err) {
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
          }
        );

      }
    }
  }
  /**
   * Remove images in dir
   * @param dir
   * @param inputDir
   * @param outputDir
   */
  async removeDir(dir: string, inputDir: string, outputDir: string) {
    const defaultConfigPath = path.join(inputDir, 'default.json');
    const baseDir = path.basename(dir);
    console.log('Directory', baseDir, 'has been removed');
    const defaultConfig = fs.readJSONSync(defaultConfigPath);
    if (fs.existsSync(dir)) {
      const files = readdirRec(dir);

      files.forEach(async (file) => {
        try {
          this.removeOneImage(file, inputDir, outputDir);

        } catch (err) {
          process.stdout.write(red);
          console.error(err.stack);
          process.stdout.write(white);

        }
      });

    }
    // for (const size in defaultConfig) {
    //   if (defaultConfig.hasOwnProperty(size)) {
    //     const dirResized = dir.replace(inputDir, path.join(outputDir, size));
    //     if (fs.existsSync(dirResized)) {
    //       try {
    //         fs.removeSync(dirResized);
    //       } catch (err) {
    //         process.stdout.write(red);
    //         console.error(err.stack);
    //         process.stdout.write(white);
    //       }
    //       console.log('Directory', baseDir, 'has been removed of', path.join(outputDir, size));
    //       if (
    //         fs.existsSync(path.join(outputDir, size)) &&
    //         fs.readdirSync(path.join(outputDir, size)).length === 0
    //       ) {
    //         await fs.rmdir(path.join(outputDir, size));
    //         console.log('Directory', size, 'has been removed of', outputDir);
    //       }
    //       if (fs.existsSync(path.join(outputDir,'resized',size)) && fs.readdirSync(path.join(outputDir,size)).length===0){
    //         await fs.rmdir(path.join(outputDir,'resized',size));
    //         console.log('Directory', path.join('resized',size), 'has been removed of', outputDir);
    //       }
    //     }
    //   }
    // }

    console.log('Directory', dir, 'has been removed of', outputDir);

  }
  /**
   * Watcher for config files.It updates images when config files are changed
   * @param inputDir
   * @param outputDir
   */
  async configWatcher(inputDir: string, outputDir: string): Promise<void> {
    Logger.log('ConfigWatcher has been launched', 'ConfigWatcher', false);
    const configWatcher = chokidar.watch(inputDir, { ignoreInitial: true, usePolling: true, interval: 300 });

    configWatcher.on('all', async (event: string, cfgFile: string) => {
      if (
        cfgFile.endsWith('.json') &&
        (event === 'add' || event === 'change')
      ) {
        if (event === 'add' || event === 'change') {
          const cfgBase = path.basename(cfgFile);
          const cfgName = path.parse(cfgFile).name;
          const dir = path.dirname(cfgFile);
          console.log(
            'Config file',
            cfgBase,
            'has been',
            event === 'add' ? event + 'ed' : event + 'd'
          );

          if (cfgBase === 'default.json') {
            this.removeAll(outputDir);
            this.resizeDir(inputDir, inputDir, outputDir);
          } else {
            const files = readdirRec(dir);
            // Files have to get different names
            const imagePath = files.filter((file) =>
              file.match(`${cfgName}(?!.*\.json)`)
            )[0];
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
        } else {
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

  /**
   * Search images mathing the regex and its resized images
   * @param regex
   * @param inputDir
   * @param outputDir
   */
  async searchImages(
    regex: string,
    inputDir: string,
    outputDir: string
  ): Promise<any[]> {
    const imgList = readdirRec(process.env.INPUT_DIR).filter(
      (img: string) =>
        path.basename(img).match(regex) &&
        !path.basename(img).match('.*.json$') &&
        !path.basename(img).match('.*.gitignore$')
    );
    const out = [];
    imgList.forEach((file) => {
      const defaultConfigPath = path.join(inputDir, 'default.json');
      const dir = path.dirname(file);
      // const base = path.basename(file);
      const ext = path.parse(file).ext;
      const name = path.parse(file).name;
      const config = this.getConfig(inputDir, file);
      const imgResized = [];
      for (const size in config) {
        if (config.hasOwnProperty(size)) {
          const opt = config[size];
          opt.outOptions.forEach(
            (outOption: { ext: string; quality: number }) => {
              let extResized = outOption.ext ? outOption.ext : ext.substring(1);
              extResized = extResized === 'jpeg' ? 'jpg' : extResized;
              const fileResize = file
                .replace(inputDir, path.join(outputDir, size))
                .replace(ext, '.' + extResized);
              // console.log(fileResize);
              if (fs.existsSync(fileResize)) {
                imgResized.push(fileResize);
              }
            }
          );
        }
      }
      out.push({ original: file, resized: imgResized });
    });
    return out;
  }
  /**
   * Get the config file of file
   * @param inputDir
   * @param file
   */
  getConfig(inputDir: string, file: string): any {

    const name = path.parse(file).name;
    let dir = path.parse(file).dir;
    if (fs.existsSync(path.join(dir, name + '.json'))) {
      // console.log(path.join(dir, name + '.json'));
      return fs.readJSONSync(path.join(dir, name + '.json'));
    } else {
      let searchConfigFile = true;
      while (searchConfigFile) {
        if (fs.existsSync(path.join(dir, 'default.json'))) {
          // console.log(path.join(dir, 'default.json'));

          return fs.readJSONSync(path.join(dir, 'default.json'));
        } else {
          dir = path.join(dir, '..');
        }

        if (path.resolve(dir) === inputDir) {
          searchConfigFile = false;
        }
      }
    }

  }

  removeAll(outputDir: string) {
    const filesToDelete = fs.readdirSync(outputDir).filter((file) => !file.endsWith('.gitignore'));
    // console.log(filesToDelete);
    filesToDelete.forEach((file) => {
      const filePath = path.join(outputDir, file);
      fs.removeSync(filePath);
      console.log(filePath, 'has been removed of', outputDir);
    });
  }

  /**
   * Function launched when the application is launched
   */
  async onApplicationBootstrap(): Promise<void> {
    try {
      this.imageWatcher(process.env.INPUT_DIR, process.env.OUTPUT_DIR);
      await this.configWatcher(process.env.INPUT_DIR, process.env.OUTPUT_DIR);
    } catch (err) {
      process.stdout.write(red);
      console.error(err.stack);
      process.stdout.write(white);
      process.exit(1);
    }
  }
}
