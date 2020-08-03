import { readFileSync } from 'fs';
export const jwtConstants = {
    secret: readFileSync('./key/jwtKey'),
};