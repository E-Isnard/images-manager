"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const users_service_1 = require("../users/users.service");
const users_module_1 = require("../users/users.module");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const constants_1 = require("./constants");
const auth_controller_1 = require("./auth.controller");
const typeorm_1 = require("@nestjs/typeorm");
const users_entity_1 = require("../users/users.entity");
const local_strategy_1 = require("./strategies/local.strategy");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const basic_strategy_1 = require("./strategies/basic.strategy");
const api_key_strategy_1 = require("./strategies/api-key.strategy");
let AuthModule = (() => {
    let AuthModule = class AuthModule {
    };
    AuthModule = __decorate([
        common_1.Module({
            imports: [typeorm_1.TypeOrmModule.forFeature([users_entity_1.UserEntity]), users_module_1.UsersModule, passport_1.PassportModule, jwt_1.JwtModule.register({
                    secret: constants_1.jwtConstants.secret,
                    signOptions: { expiresIn: '3600s' }
                })],
            providers: [auth_service_1.AuthService, users_service_1.UsersService, basic_strategy_1.HttpStrategy, local_strategy_1.LocalStrategy, jwt_strategy_1.JwtStrategy, api_key_strategy_1.ApiKeyStrategy],
            exports: [auth_service_1.AuthService],
            controllers: [auth_controller_1.AuthController]
        })
    ], AuthModule);
    return AuthModule;
})();
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map