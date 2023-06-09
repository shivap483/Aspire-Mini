import { LoanFrequency } from "../constants/enums/loan.frequency"
import { BadRequestError } from "../errors/bad.request.error"
import { LoanModel } from "../models/loan.model"
import loanRepository from "../repositories/loan.repository"
import loanUtils from "../utils/loan.utils"
import repaymentService from "./repayment.service"

const createLoan = async (
    amount: number,
    term: number,
    frequency: LoanFrequency,
    userId: number) => {
    const loan = {} as LoanModel
    await loanUtils.mapRequestBodyToLoanModel({ amount, term, frequency, userId }, loan)
    loan.repayments = await repaymentService.scheduleRepayments(loan)
    const newLoan = await loanRepository.createLoan(loan)
    console.log(`loan submitted succesfulby user:${userId}\n details: ${JSON.stringify(loan)}`)
    return newLoan
}

const getLoansByUserId = async (userId: number) => {
    const loans = await loanRepository.getLoans(userId)
    for (const loan of loans) {
        loan.repayments = await repaymentService.getRepaymentsByLoanId(loan.id)
    }
    console.log(`fetched loans by userId: ${userId}.\n loans:${JSON.stringify(loans)}`)
    return loans
}

const getLoans = async () => {
    const loans = await loanRepository.getLoans()
    return loans
}

const getLoanById = async (loanId: number) => {
    const loan = await loanRepository.getLoanById(loanId)
    return loan
}

const updateLoanStatus = async (loanId: string, newStatus: string) => {
    const loan = await getLoanById(Number(loanId))
    if (!loan) {
        throw new BadRequestError(`loan doesn't exist`)
    }
    await loanUtils.setLoanStatus(loan, newStatus)
    await loanRepository.updateLoan(loan);
    console.log(`updated loan status for loanId:${loan.id}, status: ${newStatus}`)
    return loan
}

const updateLoanPaidAmount = async (loanId: number, paidAmount: number) => {
    const loan = await getLoanById(Number(loanId))
    await loanUtils.setLoanPaidAmount(loan, paidAmount)
    await loanRepository.updateLoan(loan)
    console.log(`updated loan paid amount for loadId: ${loan.id}, amount paid: ${paidAmount}`)
    return loan;
}

export default {
    createLoan,
    getLoansByUserId,
    getLoanById,
    updateLoanStatus,
    getLoans,
    updateLoanPaidAmount,
}