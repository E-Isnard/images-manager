import { UserEntity } from './users.entity';
import { Repository } from 'typeorm';
export declare class UsersService {
    userRepository: Repository<UserEntity>;
    constructor(userRepository: Repository<UserEntity>);
    findById(_id: number): Promise<UserEntity>;
    findByUserName(username: string): Promise<UserEntity>;
    create(user: {
        id: any;
        user: any;
        password: any;
    }): Promise<void>;
}
