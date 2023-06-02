import { LoanStatus } from "../constants/enums/loan.status";
import { RepaymentStatus } from "../constants/enums/repayment.status";
import { Loan } from "../entities/loan.entity";
import { Repayment } from "../entities/repayment.entity";
import { BadRequestError } from "../errors/bad.request.error";
import { LoanModel } from "../models/loan.model";
import { RepaymentModel } from "../models/repayment.model";
import repaymentRepository from "../repositories/repayment.repository";
import repaymentUtils from "../utils/repayment.utils";
import loanService from "./loan.service";


const scheduleRepayments = async (loan: LoanModel) => {
    const loanTerm = loan.term
    const loanFrequency = loan.frequency
    const frequency = await repaymentUtils.getFrequency(loanFrequency)
    const repaymentAmount = parseFloat((loan.loanAmount / loanTerm).toFixed(5));
    let repaymentTotal = 0
    const repayments: any[] = []
    let lastRepaymentDate: Date = new Date();
    for (let i = 0; i < loanTerm; i++) {
        const model = {} as RepaymentModel
        if (i === loanTerm - 1) { // for last term, the repayment amount should be loan amount - sum of all terms except last term
            model.amount = parseFloat((loan.loanAmount - repaymentTotal).toFixed(5));
        } else {
            model.amount = repaymentAmount
            repaymentTotal += repaymentAmount
        }
        lastRepaymentDate.setDate(lastRepaymentDate.getDate() + frequency)
        model.date = new Date(lastRepaymentDate)
        model.loanId = loan.id
        model.status = RepaymentStatus.PENDING;
        const repaymentEntity = new Repayment();
        await repaymentUtils.mapRepamentModelToEntity(model, repaymentEntity)
        repaymentRepository.createRepayment(repaymentEntity)
        repayments.push(repaymentEntity)
    }
    console.log(`repayments scheduled for loan: ${loan.id}\n repayments:[${JSON.stringify(repayments)}]`)
    return repayments;
}

const getRepaymentsByLoanId = async (loadId: number) => {
    const repayments = await repaymentRepository.getRepaymentsByLoanId(loadId)
    return repayments
}

const addRepayment = async (userId: number, loanId: number, amount: number) => {
    const loan: Loan = await loanService.getLoanById(loanId)
    if (!loan) {
        throw new BadRequestError(`loan does not exist`)
    }
    if (loan.userId !== userId) {
        throw new BadRequestError(`loan does not belong to user`)
    }
    if (loan.status === LoanStatus.PAID) {
        throw new BadRequestError(`loan is already paid`)
    }
    if (loan.status !== LoanStatus.APPROVED) {
        throw new BadRequestError(`loan is not approved yet`)
    }
    const loanBalance = loan.loanAmount - loan.paidAmount
    if (amount > loanBalance) {
        throw new BadRequestError(`Amount greater than loan balance`)
    }
    const loanRepayments: Repayment[] = await getRepaymentsByLoanId(loanId)
    if (loanRepayments.length === 0) {
        throw new BadRequestError(`no repayments found`)
    }
    const repaymentToBeAdded: Repayment = await repaymentUtils.getLatestPendingRepayment(loanRepayments)
    if (!repaymentToBeAdded) {
        throw new BadRequestError(`no pending repayments for this loan`)
    }
    if (amount < repaymentToBeAdded.repaymentAmount) {
        throw new BadRequestError(`amount less than repayment amount`)
    }
    repaymentToBeAdded.paidAmount = amount
    repaymentToBeAdded.status = RepaymentStatus.PAID
    await repaymentRepository.updateRepayment(repaymentToBeAdded)
    const excessAmount = repaymentToBeAdded.paidAmount - repaymentToBeAdded.repaymentAmount
    const pendingRepayments: Repayment[] = await repaymentRepository.getPendingRepaymentsByLoanId(loanId)
    if (excessAmount > 0 && pendingRepayments.length > 0) {
        const repaymentAdjustAmount = parseFloat((excessAmount / pendingRepayments.length).toFixed(5));
        for (const repayment of pendingRepayments) {
            repayment.repaymentAmount = parseFloat((repayment.repaymentAmount - repaymentAdjustAmount).toFixed(5));
            await repaymentRepository.updateRepayment(repayment)
        }
    }
    await loanService.updateLoanPaidAmount(loanId, amount)
    if (pendingRepayments.length === 0) {
        loanService.updateLoanStatus(String(loanId), "paid")
    }
    console.log(`repayment done for loan: ${loan.id}\n repayment:[${JSON.stringify(repaymentToBeAdded)}]`)
    return repaymentToBeAdded
}

export default {
    scheduleRepayments,
    getRepaymentsByLoanId,
    addRepayment,
}