import sinon from "sinon";
import chai, { expect } from "chai";
import repaymentService from "../../app/services/repayment.service";
import repaymentRepository from "../../app/repositories/repayment.repository";
import loanService from "../../app/services/loan.service";
import { LoanStatus } from "../../app/constants/enums/loan.status";
import { BadRequestError } from "../../app/errors/bad.request.error";
import { Loan } from "../../app/entities/loan.entity";
import { Repayment } from "../../app/entities/repayment.entity";
import repaymentUtils from "../../app/utils/repayment.utils";
import { RepaymentStatus } from "../../app/constants/enums/repayment.status";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("Repayment Service", () => {
    afterEach(() => {
        sinon.restore();
    })
    describe("scheduleRepayments", () => {
        it("should schedule repayments correctly", async () => {
            const loan = {
                id: 1,
                term: 4,
                frequency: "WEEKLY",
                loanAmount: 1000,
            } as Loan;

            const getFrequencyStub = sinon.stub(repaymentUtils, "getFrequency").resolves(7);
            const mapRepamentModelToEntityStub = sinon.stub(repaymentUtils, "mapRepamentModelToEntity");

            const result = await repaymentService.scheduleRepayments(loan);

            expect(getFrequencyStub.calledOnceWithExactly(loan.frequency)).to.be.true;
            expect(mapRepamentModelToEntityStub.callCount).to.equal(4);
            expect(result).to.have.lengthOf(4);
        });
    });

    describe("addRepayment", () => {

        it("should throw an error if loan does not belong to user", async () => {

            const userId = 1;
            const loanId = 1;
            const amount = 200;

            const loan = new Loan();
            loan.userId = 2;
            loan.status = LoanStatus.APPROVED;

            sinon.stub(loanService, "getLoanById").resolves(loan);

            await expect(repaymentService.addRepayment(userId, loanId, amount)).to.be.rejectedWith(BadRequestError, "loan does not belong to user");
        });

        it("should throw an error if loan is already paid", async () => {

            const userId = 1;
            const loanId = 1;
            const amount = 200;

            const loan = new Loan();
            loan.userId = userId;
            loan.status = LoanStatus.PAID;

            sinon.stub(loanService, "getLoanById").resolves(loan);

            await expect(repaymentService.addRepayment(userId, loanId, amount)).to.be.rejectedWith(BadRequestError, "loan is already paid");
        });

        it("should throw an error if loan is not approved yet", async () => {

            const userId = 1;
            const loanId = 1;
            const amount = 200;

            const loan = new Loan();
            loan.userId = userId;
            loan.status = LoanStatus.PENDING;

            sinon.stub(loanService, "getLoanById").resolves(loan);

            await expect(repaymentService.addRepayment(userId, loanId, amount)).to.be.rejectedWith(BadRequestError, "loan is not approved yet");
        });

        it("should throw an error if amount is greater than loan balance", async () => {

            const userId = 1;
            const loanId = 1;
            const amount = 200;

            const loan = new Loan();
            loan.userId = userId;
            loan.status = LoanStatus.APPROVED;
            loan.loanAmount = 100;
            loan.paidAmount = 50;

            sinon.stub(loanService, "getLoanById").resolves(loan);

            await expect(repaymentService.addRepayment(userId, loanId, amount)).to.be.rejectedWith(BadRequestError, "Amount greater than loan balance");
        });

        it("should throw an error if no repayments found for the loan", async () => {

            const userId = 1;
            const loanId = 1;
            const amount = 200;

            const loan = new Loan();
            loan.userId = userId;
            loan.status = LoanStatus.APPROVED;

            sinon.stub(loanService, "getLoanById").resolves(loan);

            sinon.stub(repaymentRepository, "getRepaymentsByLoanId").resolves([]);

            await expect(repaymentService.addRepayment(userId, loanId, amount)).to.be.rejectedWith(BadRequestError, "no repayments found");
        });

        it("should throw an error if no pending repayments found for the loan", async () => {

            const userId = 1;
            const loanId = 1;
            const amount = 200;

            const loan = new Loan();
            loan.userId = userId;
            loan.status = LoanStatus.APPROVED;

            sinon.stub(loanService, "getLoanById").resolves(loan);

            const completedRepayment = new Repayment();
            completedRepayment.status = RepaymentStatus.PAID;
            sinon.stub(repaymentRepository, "getRepaymentsByLoanId").resolves([completedRepayment]);

            await expect(repaymentService.addRepayment(userId, loanId, amount)).to.be.rejectedWith(BadRequestError, "no pending repayments for this loan");
        });

        it("should throw an error if amount is less than repayment amount", async () => {

            const userId = 1;
            const loanId = 1;
            const amount = 50;

            const loan = new Loan();
            loan.userId = userId;
            loan.status = LoanStatus.APPROVED;

            sinon.stub(loanService, "getLoanById").resolves(loan);

            const pendingRepayment = new Repayment();
            pendingRepayment.status = RepaymentStatus.PENDING;
            pendingRepayment.repaymentAmount = 100;
            sinon.stub(repaymentRepository, "getRepaymentsByLoanId").resolves([pendingRepayment]);

            await expect(repaymentService.addRepayment(userId, loanId, amount)).to.be.rejectedWith(BadRequestError, "amount less than repayment amount");
        });

        it("should add a repayment successfully", async () => {

            const userId = 1;
            const loanId = 1;
            const amount = 200;

            const loan = new Loan();
            loan.id = loanId
            loan.userId = userId;
            loan.status = LoanStatus.APPROVED;

            const repayment = new Repayment();
            repayment.repaymentAmount = 100;

            const getLoanByIdStub = sinon.stub(loanService, "getLoanById").resolves(loan);
            const getRepaymentsByLoanIdStub = sinon.stub(repaymentRepository, "getRepaymentsByLoanId").resolves([repayment]);
            const getLatestPendingRepaymentStub = sinon.stub(repaymentUtils, "getLatestPendingRepayment").resolves(repayment);
            const updateRepaymentStub = sinon.stub(repaymentRepository, "updateRepayment");
            const getPendingRepaymentsByLoanIdStub = sinon.stub(repaymentRepository, "getPendingRepaymentsByLoanId").resolves([]);
            const updateLoanPaidAmountStub = sinon.stub(loanService, "updateLoanPaidAmount");
            const updateLoanStatusStub = sinon.stub(loanService, "updateLoanStatus");

            const result = await repaymentService.addRepayment(userId, loanId, amount);

            expect(getLoanByIdStub.calledOnceWithExactly(loanId)).to.be.true;
            expect(getRepaymentsByLoanIdStub.calledOnceWithExactly(loanId)).to.be.true;
            expect(getLatestPendingRepaymentStub.calledOnce).to.be.true;
            expect(updateRepaymentStub.calledOnceWithExactly(repayment)).to.be.true;
            expect(getPendingRepaymentsByLoanIdStub.calledOnceWithExactly(loanId)).to.be.true;
            expect(updateLoanPaidAmountStub.calledOnceWithExactly(loanId, amount)).to.be.true;
            expect(updateLoanStatusStub.calledOnceWithExactly(String(loanId), "paid")).to.be.true;
            expect(result).to.deep.equal(repayment);
        });

        it("should throw an error if loan does not exist", async () => {

            const userId = 1;
            const loanId = 1;
            const amount = 200;

            sinon.stub(loanService, "getLoanById").resolves(null);

            await expect(repaymentService.addRepayment(userId, loanId, amount)).to.be.rejectedWith(BadRequestError, "loan does not exist");
        });
    });
});

