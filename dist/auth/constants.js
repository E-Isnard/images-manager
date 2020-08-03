"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = void 0;
const fs_1 = require("fs");
exports.jwtConstants = {
    secret: fs_1.readFileSync('./key/jwtKey'),
};
//# sourceMappingURL=constants.js.map