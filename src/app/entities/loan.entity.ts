import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { DatetimeEntity } from "./base/base.entity";
import { Repayment } from "./repayment.entity";
import { User } from "./user.entity";
import { LoanStatus } from "../constants/enums/loan.status";
import { LoanFrequency } from "../constants/enums/loan.frequency";

@Entity('loan')
export class Loan extends DatetimeEntity {

    @PrimaryColumn({ name: 'id' }) id: number;

    @Column({ name: 'user_id' }) userId: number;
    
    @Column({ name: 'amount'}) loanAmount: number;
    
    @Column({ name: 'term' }) term: number;
    
    @Column({ name: 'frequency' }) frequency: LoanFrequency;
    
    @Column({ name: 'status' }) status: LoanStatus;
    
    @Column({ name: 'paid_amount' }) paidAmount: number;

    @OneToMany( (type) => Repayment, (repayment) => repayment.id ) repayments: Repayment[]

    @ManyToOne(
        (type) => User,
        (user) => user.id,
    )
    @JoinColumn({ name: 'user_id' }) user: User
}