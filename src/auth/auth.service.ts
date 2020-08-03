import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(public userService: UsersService, private jwtService: JwtService) { }

    async validateUser(username: string, password: string): Promise<any> {

        const user = await this.userService.findByUserName(username);

        if (user && await bcrypt.compare(password, user.password)) {
            // tslint:disable-next-line: no-shadowed-variable
            const { password, ...result } = user;

            return result;
        }

        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id };

        return {
            access_token: this.jwtService.sign(payload)
        };
    }

    validateApiKey(apiKey: string) {
        return apiKey === process.env.API_KEY;
    }
}
