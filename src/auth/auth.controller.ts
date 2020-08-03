import { Controller, Post, Body, Get, UseGuards, Res, HttpStatus, Request, Header, Query, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBasicAuth, ApiOperation, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }
    // @ApiOperation({ summary: 'Login', tags: ['Authentication'], description: 'Route for login' })
    // @UseGuards(AuthGuard('basic'))
    // @ApiBasicAuth('login')
    // @Post('login')
    // async login(@Request() req: any) {
    //     return this.authService.login(req.user);
    // }

    // @Get('test')
    // @ApiOperation({ summary: 'test', tags: ['Authentication'], description: 'Route for test' })
    // @ApiBearerAuth('access-token')
    // @UseGuards(AuthGuard('jwt'))
    // async test() {
    //     return { message: 'OK', statusCode: HttpStatus.OK };
    // }

    @Post('createUser')
    @ApiOperation({ summary: 'create', tags: ['Authentication'], description: 'Route to create a new user' })
    @UseGuards(AuthGuard('headerapikey'))
    @ApiBody({ description: 'create user', schema: { example: { id: 1, username: 'root', password: 'test' } } })
    @ApiBasicAuth('Api-Key')
    async createUser(@Body() body: any) {
        const user = { id: body.id, user: body.username, password: body.password };
        if (await this.authService.userService.findByUserName(body.username) || await this.authService.userService.findById(body.id)) {
            throw new UnauthorizedException('User id or username already exists');
        }
        await this.authService.userService.create(user);
        return `user ${user.user} created`;
    }

}
