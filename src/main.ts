import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import * as helmet from 'helmet';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

dotenv.config();

export const pathPublic = resolve(__dirname, '..', 'public');

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(helmet());
  const optionsSwaggerJobs = new DocumentBuilder()
    .setTitle('Image manager TJ')
    .setDescription(
      'Image manager used to resize images for aeroports-voyages.fr website',
    )
    .setVersion('1.0')
    // .addBearerAuth({type:'http',scheme:'bearer',bearerFormat:'JWT'},'access-token')
    .addBasicAuth({type:'http'},'login')
    .addBasicAuth({type:'apiKey',name:'api-key',in:'header'},'Api-Key')
    .build();
  const documentSwaggerJobs = SwaggerModule.createDocument(
    app,
    optionsSwaggerJobs
  );
  SwaggerModule.setup('api', app, documentSwaggerJobs);
  await app.listen(process.env.PORT);
  // Logger.log(`Application is running on: ${await app.getUrl()}`, 'NestApplication.URL', false);
  if (process.env.NODE_ENV === 'prod') {
    Logger.log(
      `Application is running on: https://traveljuice-seo.prod.traveljuice.fr`,
      'NestApplication.URL',
      false,
    );
  } else {
    Logger.log(
      `Application is running on: http://localhost:${process.env.PORT}`,
      'NestApplication.URL',
      false,
    );
  }
}
bootstrap();
