import db from "../config/db";
import { RepaymentStatus } from "../constants/enums/repayment.status";
import { Repayment } from "../entities/repayment.entity";

const createRepayment = async (item: Repayment) => {
    db.repayments.set(item.id, item)

}

const getRepaymentsByLoanId = async (loanId: number) => {
    const repayments: Repayment[] = Array.from(db.repayments.values())
    const loanRepayments = []
    for (const repayment of repayments) {
        if (repayment.loanId === loanId) {
            loanRepayments.push(repayment)
        }
    }
    return loanRepayments
}

const updateRepayment = async (repayment: Repayment) => {
    db.repayments.set(repayment.id, repayment)
}

const getPendingRepaymentsByLoanId = async (loanId: number) => {
    const repayments: Repayment[] = Array.from(db.repayments.values())
    const pendingRepayments = []
    for (const repayment of repayments) {
        if (repayment.loanId === loanId && repayment.status === RepaymentStatus.PENDING) {
            pendingRepayments.push(repayment)
        }
    }
    return pendingRepayments
}

export default {
    createRepayment,
    getRepaymentsByLoanId,
    updateRepayment,
    getPendingRepaymentsByLoanId
}