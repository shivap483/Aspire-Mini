import { LoanFrequency } from "../constants/enums/loan.frequency";
import { LoanStatus } from "../constants/enums/loan.status";
import { Repayment } from "../entities/repayment.entity";

export interface LoanModel {
    id: number,
    loanAmount: number,
    term: number,
    excessAmount: number,
    frequency: LoanFrequency,
    repayments: Repayment[],
    status: LoanStatus,
    userId: number,
}