import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { DatetimeEntity } from "./base/base.entity";
import { Loan } from "./loan.entity";
import { UserTypes } from "../constants/enums/user.types";

@Entity('user')
export class User extends DatetimeEntity {

    @PrimaryColumn({ name: 'id' }) id: number;

    @Column({ name: 'email' }) email: string;

    @Column({ name: 'name' }) userName: string;

    @Column({ name: 'password' }) password: string;

    @Column({ name: 'type' }) type: UserTypes;

    @OneToMany((type) => Loan, (loan) => loan.user) loans: Loan[]

}