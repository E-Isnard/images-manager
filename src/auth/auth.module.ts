import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {jwtConstants} from './constants';
import { AuthController } from './auth.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserEntity} from '../users/users.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { HttpStrategy } from './strategies/basic.strategy';
import {ApiKeyStrategy} from './strategies/api-key.strategy';

@Module({
  imports:[TypeOrmModule.forFeature([UserEntity]),UsersModule,PassportModule,JwtModule.register({
    secret:jwtConstants.secret,
    signOptions:{expiresIn:'3600s'}
  })],
  providers: [AuthService,UsersService,HttpStrategy,LocalStrategy,JwtStrategy,ApiKeyStrategy],
  exports:[AuthService],
  controllers: [AuthController]

})
export class AuthModule {}
