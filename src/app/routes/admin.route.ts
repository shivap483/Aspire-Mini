import express from "express";
import userController from "../controllers/user.controller";
import loanController from "../controllers/loan.controller";

const router = express.Router();

router.post('/login', userController.adminLogin);
router.get('/loans', loanController.getLoans)
router.put('/loan/:id', loanController.updateLoan)

export default router;