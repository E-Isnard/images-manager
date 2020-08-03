"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathPublic = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const dotenv = require("dotenv");
const helmet = require("helmet");
const swagger_1 = require("@nestjs/swagger");
dotenv.config();
exports.pathPublic = path_1.resolve(__dirname, '..', 'public');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(helmet());
    const optionsSwaggerJobs = new swagger_1.DocumentBuilder()
        .setTitle('Image manager')
        .setDescription('Image manager used to resize images')
        .setVersion('1.0')
        .addBasicAuth({ type: 'http' }, 'login')
        .addBasicAuth({ type: 'apiKey', name: 'api-key', in: 'header' }, 'Api-Key')
        .build();
    const documentSwaggerJobs = swagger_1.SwaggerModule.createDocument(app, optionsSwaggerJobs);
    swagger_1.SwaggerModule.setup('api', app, documentSwaggerJobs);
    await app.listen(process.env.PORT);
    common_1.Logger.log(`Application is running on: http://localhost:${process.env.PORT}`, 'NestApplication.URL', false);
}
bootstrap();
//# sourceMappingURL=main.js.map