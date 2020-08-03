import { Test, TestingModule } from '@nestjs/testing';
import { ImageResizerController } from './image-resizer.controller';
import { ImageResizerService } from './image-resizer.service';

describe('ImageResizer Controller', () => {
  let controller: ImageResizerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageResizerController],providers:[ImageResizerService]
    }).compile();

    controller = module.get<ImageResizerController>(ImageResizerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
