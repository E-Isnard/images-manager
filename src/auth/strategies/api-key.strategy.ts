import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
    constructor(private authService: AuthService) {
        super({ header: 'api-key', prefix: '' }, false);

    }

    validate(apiKey: string) {

        const checkApiKey = this.authService.validateApiKey(apiKey);

        if (!checkApiKey) {
            throw new UnauthorizedException('Wrong api key');
        }

        return 'All is ok';
    }
}