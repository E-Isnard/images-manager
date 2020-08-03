import { BasicStrategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class HttpStrategy extends PassportStrategy(BasicStrategy) {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {

        const user = await this.authService.validateUser(username, password);
        if (!user) {

            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }
}