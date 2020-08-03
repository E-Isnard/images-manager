import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageResizerModule } from './image-resizer/image-resizer.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ImageResizerModule, AuthModule, UsersModule, TypeOrmModule.forRoot()],
  providers: [AppService],
  controllers: [AppController]
})
export class AppModule { }
