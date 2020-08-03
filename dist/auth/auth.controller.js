"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
let AuthController = (() => {
    let AuthController = class AuthController {
        constructor(authService) {
            this.authService = authService;
        }
        async createUser(body) {
            const user = { id: body.id, user: body.username, password: body.password };
            if (await this.authService.userService.findByUserName(body.username) || await this.authService.userService.findById(body.id)) {
                throw new common_1.UnauthorizedException('User id or username already exists');
            }
            await this.authService.userService.create(user);
            return `user ${user.user} created`;
        }
    };
    __decorate([
        common_1.Post('createUser'),
        swagger_1.ApiOperation({ summary: 'create', tags: ['Authentication'], description: 'Route to create a new user' }),
        common_1.UseGuards(passport_1.AuthGuard('headerapikey')),
        swagger_1.ApiBody({ description: 'create user', schema: { example: { id: 1, username: 'root', password: 'test' } } }),
        swagger_1.ApiBasicAuth('Api-Key'),
        __param(0, common_1.Body()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], AuthController.prototype, "createUser", null);
    AuthController = __decorate([
        common_1.Controller('auth'),
        __metadata("design:paramtypes", [auth_service_1.AuthService])
    ], AuthController);
    return AuthController;
})();
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map