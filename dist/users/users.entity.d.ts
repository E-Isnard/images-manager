export declare class UserEntity {
    id: number;
    user: string;
    password: string;
    hashPassword(): Promise<void>;
}
