import express from "express";
import loanRoute from '../routes/loan.route'
import userRoute from '../routes/user.route'
import adminRoute from "./admin.route";

const router = express.Router();

router.use('/v1/users', userRoute)
router.use('/v1/admin', adminRoute)
router.use('/v1/loan', loanRoute)
export default router;