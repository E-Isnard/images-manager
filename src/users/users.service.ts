import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './users.entity';
import { Repository, getManager } from 'typeorm';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(UserEntity)
        public userRepository: Repository<UserEntity>
    ) { }

    async findById(_id: number): Promise<UserEntity> {

        return await this.userRepository.findOne({
            where: {
                id: _id
            }
        });
    }

    async findByUserName(username:string):Promise<UserEntity>{

        return await this.userRepository.findOne({
            where:{
                user:username
            }
        });
    }

    public async create(user: { id: any; user: any; password: any; }) {
        const userEntity = new UserEntity();
        userEntity.id = user.id;
        userEntity.password=user.password;
        userEntity.user=user.user;

        this.userRepository.save(userEntity);
    }
}
