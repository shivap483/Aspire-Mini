import db from "../config/db";
import { Loan } from "../entities/loan.entity"
import { LoanModel } from "../models/loan.model";
import loanUtils from "../utils/loan.utils";

const createLoan =async (loan: LoanModel) => {
    const newLoan = new Loan();
    loanUtils.mapLoanModelToEntity(newLoan, loan)
    db.loans.set(newLoan.id, newLoan)
    return newLoan;
}

const getLoans = async (userId?: number) => {
    const loans = Array.from(db.loans.values())
    if(userId) {
        const data = []
        for(const loan of loans) {
            if(loan.userId === userId){
                data.push(loan)
            }
        }
        return data
    } else {
        return loans
    }
}

const getLoanById = async (loanId?: number) => {
    const loan = await db.loans.get(loanId)
    return loan;
}


const updateLoan = async(loan: Loan) => {
    db.loans.set(loan.id, loan)
}

export default {
    createLoan, 
    getLoans,
    getLoanById,
    updateLoan,
}