"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readdirRec = void 0;
const fs = require("fs");
const path = require("path");
const readdirRec = (dirPath, checkDir = false, listFiles = []) => {
    const files = fs.readdirSync(dirPath);
    listFiles = listFiles || [];
    files.forEach((file) => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            if (checkDir) {
                listFiles.push(path.join(dirPath, file));
            }
            listFiles = readdirRec(path.join(dirPath, file), checkDir, listFiles);
        }
        else {
            if (!checkDir) {
                listFiles.push(path.join(dirPath, file));
            }
        }
    });
    return listFiles;
};
exports.readdirRec = readdirRec;
//# sourceMappingURL=readdirRec.js.map