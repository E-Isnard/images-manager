import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, AfterInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        nullable: false,
        unique: true
    })
    user: string;

    @Column({
        type:'varchar',
        nullable:false
    })
    password: string;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(){
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt);
    }
}