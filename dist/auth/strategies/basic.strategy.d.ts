import { BasicStrategy } from 'passport-http';
import { AuthService } from '../auth.service';
declare const HttpStrategy_base: new (...args: any[]) => BasicStrategy;
export declare class HttpStrategy extends HttpStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(username: string, password: string): Promise<any>;
}
export {};
