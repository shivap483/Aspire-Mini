import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { DatetimeEntity } from "./base/base.entity";
import { Loan } from "./loan.entity";
import { RepaymentStatus } from "../constants/enums/repayment.status";

@Entity('repayment')
export class Repayment extends DatetimeEntity {

    @PrimaryColumn({ name: 'id' }) id: number;

    @Column({ name: 'loan_id' }) loanId: number;
    
    @Column({ name: 'amount'}) repaymentAmount: number;
    
    @Column({ name: 'date' }) repaymentDate: Date;
    
    @Column({ name: 'status' }) status: RepaymentStatus;
    
    @Column({ name: 'paid_amount' }) paidAmount: number;

    @ManyToOne(
        (type) => Loan,
        (loan) => loan.repayments,
    )
    @JoinColumn({ name: 'loan_id' }) loan: Loan
}