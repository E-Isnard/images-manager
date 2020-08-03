import * as fs from 'fs';
import * as path from 'path';

const readdirRec = (dirPath: string, checkDir = false, listFiles = []) => {

    const files = fs.readdirSync(dirPath);

    listFiles = listFiles || [];

    files.forEach((file) => {

        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            if (checkDir) {
                listFiles.push(path.join(dirPath, file));
            }
            listFiles = readdirRec(path.join(dirPath, file), checkDir, listFiles);
        } else {
            if (!checkDir) {

                listFiles.push(path.join(dirPath, file));
            }
        }
    });

    return listFiles;

};

export { readdirRec };