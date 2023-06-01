import { RepaymentStatus } from "../constants/enums/repayment.status";



export interface RepaymentModel {
    id: number,
    amount: number,
    date: Date,
    paidAmout: number,
    paidDate: Date,
    status: RepaymentStatus,
    loanId: number,
}