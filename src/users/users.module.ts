import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {TypeOrmModule,TypeOrmModuleOptions} from '@nestjs/typeorm';
import {UserEntity} from './users.entity';

@Module({
  providers: [UsersService],
  imports:[TypeOrmModule.forFeature([UserEntity])],
  exports:[UsersService]
})
export class UsersModule {}
