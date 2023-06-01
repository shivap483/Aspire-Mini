import express from "express";
import loanController from "../controllers/loan.controller";

const router = express.Router();

router.post('/', loanController.createLoan)
router.get('/', loanController.getUserLoans)
router.post('/:loanId', loanController.userRepayment)

export default router;