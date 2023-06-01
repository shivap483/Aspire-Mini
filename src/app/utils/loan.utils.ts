import db from "../config/db"
import { LoanStatus } from "../constants/enums/loan.status";
import { Loan } from "../entities/loan.entity";
import { LoanModel } from "../models/loan.model";

const generateLoanId = async() => {
    return db.loans.size + 1;
}

const mapLoanModelToEntity = async(loanEntity: Loan, loanModel: LoanModel) => {
    loanEntity.id = loanModel.id
    loanEntity.paidAmount = 0
    loanEntity.frequency = loanModel.frequency
    loanEntity.loanAmount = loanModel.loanAmount
    loanEntity.repayments = loanModel.repayments
    loanEntity.status = LoanStatus.PENDING
    loanEntity.term = loanModel.term
    loanEntity.userId = loanModel.userId
}

const mapRequestBodyToLoanModel = async(reqBody: any, loanModel: LoanModel) => {
    loanModel.id = await generateLoanId()
    loanModel.excessAmount = 0
    loanModel.frequency = reqBody.frequency
    loanModel.loanAmount = reqBody.amount
    loanModel.term = reqBody.term 
    loanModel.userId = reqBody.userId
}

const setLoanStatus = async(loan: Loan, action: string) => {
    let status = loan.status
    action = action.toLowerCase();
    switch (action) {
        case "approve":
            status = LoanStatus.APPROVED
            break;
        case "paid":
            status = LoanStatus.PAID
            break;
    
        default:
            break;
    }
    loan.status = status
}

const setLoanPaidAmount = async(loan: Loan, amount: number) => {
    loan.paidAmount += amount
}

export default {
    mapLoanModelToEntity,
    mapRequestBodyToLoanModel,
    setLoanStatus,
    setLoanPaidAmount
}