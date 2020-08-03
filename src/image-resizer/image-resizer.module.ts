import { Module } from '@nestjs/common';
import { ImageResizerController } from './image-resizer.controller';
import { ImageResizerService } from './image-resizer.service';

@Module({
  controllers: [ImageResizerController],
  providers: [ImageResizerService]
})
export class ImageResizerModule {}
