import IController from "IController";
import { NotFoundError } from "../errors/not.found.error";
import loanService from "../services/loan.service";
import userService from "../services/user.service";
import { UserTypes } from "../constants/enums/user.types";
import repaymentService from "../services/repayment.service";


const createLoan: IController = async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        const err = new NotFoundError(`User not logged in`)
        return res.status(err.statusCode).send(err.message)
    }
    const user = await userService.getUserById(userId)
    if (!user || user.type !== UserTypes.USER) {
        const err = new NotFoundError(`Invalid user. Please login again`)
        return res.status(err.statusCode).send(err.message)
    }
    loanService.createLoan(req.body, userId)
        .then((loan) => {
            return res.json({
                message: "loan created",
                loanDetails: { ...loan }
            })
        })
        .catch((err) => {
            return res.status(err.statusCode).send(`failed to create loan`)
        })
}

const getUserLoans: IController = async (req, res) => {
    const userId = req.session.userId
    if (!userId) {
        const err = new NotFoundError(`User not logged in`)
        return res.status(err.statusCode).send(err.message)
    }
    const user = await userService.getUserById(userId)
    if (!user) {
        const err = new NotFoundError(`Invalid user. Please login again`)
        return res.status(err.statusCode).send(err.message)
    }
    const userLoans = await loanService.getLoansByUserId(user.id)
    return res.json(userLoans)
}

const getLoans: IController = async (req, res) => {
    const userId = req.session.userId
    if (!userId) {
        const err = new NotFoundError(`User not logged in`)
        return res.status(err.statusCode).send(err.message)
    }
    const user = await userService.getUserById(userId)
    if (!user || user.type !== UserTypes.ADMIN_USER) {
        const err = new NotFoundError(`Invalid user. Please login again`)
        return res.status(err.statusCode).send(err.message)
    }
    const userLoans = await loanService.getLoans()
    return res.json(userLoans)
}

const updateLoan: IController = async (req, res) => {
    const userId = req.session.userId
    const user = await userService.getUserById(userId)
    if (!user || user.type !== UserTypes.ADMIN_USER) {
        const err = new NotFoundError(`Invalid user. Please login again`)
        return res.status(err.statusCode).send(err.message)
    }
    loanService.updateLoanStatus(req.params.id, req.query.action as string)
        .then((updateLoan) => {
            return res.json({ message: 'loan approved', updatedLoan: { ...updateLoan } })
        })
        .catch((error) => {
            return res.status(400).send(
                `loan approval fail. error: ${error.message}`
            )
        })
}

const userRepayment: IController = async (req, res) => {
    const userId = req.session.userId
    const loanId = req.params.loanId
    const amount = req.body.amount
    if (!userId) {
        const err = new NotFoundError(`User not logged in`)
        return res.status(err.statusCode).send(err.message)
    }
    const user = await userService.getUserById(userId)
    if (!user || user.type !== UserTypes.USER) {
        const err = new NotFoundError(`Invalid user. Please login again`)
        return res.status(err.statusCode).send(err.message)
    }
    repaymentService.addRepayment(userId, Number(loanId), amount)
        .then((_) => {
            return res.json({ message: 'repayment successful' })
        })
        .catch((err) => {
            return res.status(err.statusCode).send(err.message)
        })
}

export default {
    createLoan,
    getUserLoans,
    getLoans,
    updateLoan,
    userRepayment
}