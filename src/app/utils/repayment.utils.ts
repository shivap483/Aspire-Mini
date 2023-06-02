import db from "../config/db";
import { LoanFrequency } from "../constants/enums/loan.frequency"
import { RepaymentStatus } from "../constants/enums/repayment.status";
import { Repayment } from "../entities/repayment.entity"
import { RepaymentModel } from "../models/repayment.model"

const getFrequency = async (loanFrequency: LoanFrequency) => {

    switch (loanFrequency) {
        case LoanFrequency.WEEKLY:
            return 7;
        case LoanFrequency.MONTHLY:
            return 30;

        default:
            return 7;
    }

}

const mapRepamentModelToEntity = async (
    model: RepaymentModel,
    entity: Repayment) => {
    entity.id = await getRepaymentId();
    entity.loanId = model.loanId
    entity.repaymentAmount = model.amount
    entity.paidAmount = 0
    entity.repaymentDate = model.date
    entity.status = model.status
}

const getRepaymentId = async () => {
    return db.repayments.size + 1
}

const getLatestPendingRepayment = async (repayments: Repayment[]) => {
    repayments.sort((a, b) => a.repaymentDate.getTime() - b.repaymentDate.getTime())
    let latestPendingRepayment = null;
    for (const repayment of repayments) {
        if (repayment.status === RepaymentStatus.PENDING) {
            latestPendingRepayment = repayment
            break;
        }
    }
    return latestPendingRepayment;
}

const checkRepaymentsDone = async (repayments: Repayment[]) => {
    for (const repayment of repayments) {
        if (repayment.status === RepaymentStatus.PENDING)
            return false
    }
    return true
}

const getPendingRepayments = async (repayments: Repayment[]) => {
    repayments.sort((a, b) => a.repaymentDate.getTime() - b.repaymentDate.getTime())
    const pendingRepayments = [];
    for (const repayment of repayments) {
        if (repayment.status === RepaymentStatus.PENDING) {
            pendingRepayments.push(repayment)
        }
    }
    return pendingRepayments;
}

export default {
    __private__: { getRepaymentId },
    getFrequency,
    mapRepamentModelToEntity,
    getLatestPendingRepayment,
    checkRepaymentsDone,
    getPendingRepayments,
}