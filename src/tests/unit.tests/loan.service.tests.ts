import sinon from "sinon";
import { expect } from 'chai';
import { LoanFrequency } from "../../app/constants/enums/loan.frequency";
import { BadRequestError } from "../../app/errors/bad.request.error";
import loanRepository from "../../app/repositories/loan.repository";
import loanService from "../../app/services/loan.service";
import repaymentService from "../../app/services/repayment.service";
import loanUtils from "../../app/utils/loan.utils";
import { Loan } from "../../app/entities/loan.entity";
import { LoanStatus } from "../../app/constants/enums/loan.status";


describe('Loan Service', () => {
    afterEach(() => {
        sinon.restore();
    })
    describe('createLoan', () => {
        it('should create a new loan', async () => {
            const amount = 1000;
            const term = 12;
            const frequency = LoanFrequency.MONTHLY;
            const userId = 123;
            const loan = new Loan();
            const repayments = ['repayment1', 'repayment2'];

            const mapRequestBodyToLoanModelStub = sinon.stub(loanUtils, 'mapRequestBodyToLoanModel').resolves();
            const scheduleRepaymentsStub = sinon.stub(repaymentService, 'scheduleRepayments').resolves(repayments);
            const createLoanStub = sinon.stub(loanRepository, 'createLoan').resolves(loan);

            const result = await loanService.createLoan(amount, term, frequency, userId);

            expect(result).to.deep.equal(loan);
            expect(mapRequestBodyToLoanModelStub.calledOnce).to.be.true;
            expect(scheduleRepaymentsStub.calledOnce).to.be.true;
            expect(createLoanStub.calledOnce).to.be.true;
        });
    });

    describe('getLoansByUserId', () => {
        it('should get loans by user ID', async () => {
            const userId = 123;
            const loans = [{ id: 1 }, { id: 2 }];

            const getLoansStub = sinon.stub(loanRepository, 'getLoans').resolves(loans);
            const getRepaymentsByLoanIdStub = sinon.stub(repaymentService, 'getRepaymentsByLoanId').resolves();

            const result = await loanService.getLoansByUserId(userId);

            expect(result).to.deep.equal(loans);
            expect(getLoansStub.calledOnceWithExactly(userId)).to.be.true;
            expect(getRepaymentsByLoanIdStub.calledTwice).to.be.true;

        });
    });

    describe('getLoans', () => {
        it('should get all loans', async () => {
            const loans = ['loan1', 'loan2'];

            const getLoansStub = sinon.stub(loanRepository, 'getLoans').resolves(loans);

            const result = await loanService.getLoans();

            expect(result).to.deep.equal(loans);
            expect(getLoansStub.calledOnce).to.be.true;
        });
    });

    describe('getLoanById', () => {
        it('should get a loan by ID', async () => {
            const loanId = 123;
            const loan = 'loan';

            const getLoanByIdStub = sinon.stub(loanRepository, 'getLoanById').resolves(loan);

            const result = await loanService.getLoanById(loanId);

            expect(result).to.equal(loan);
            expect(getLoanByIdStub.calledOnceWithExactly(loanId)).to.be.true;
        });
    });

    describe('updateLoanStatus', () => {
        afterEach(() => {
            sinon.restore();
        })
        it('should update the status of a loan', async () => {
            const loanId = '123';
            const newStatus = 'approved';
            const loan = new Loan();
            loan.id = 123;
            loan.status = LoanStatus.PENDING;

            const getLoanByIdStub = sinon.stub(loanRepository, 'getLoanById').resolves(loan);
            const setLoanStatusStub = sinon.stub(loanUtils, 'setLoanStatus').resolves();
            const updateLoanStub = sinon.stub(loanRepository, 'updateLoan').resolves();

            const result = await loanService.updateLoanStatus(loanId, newStatus);

            expect(result).to.deep.equal(loan);
            expect(getLoanByIdStub.calledOnceWithExactly(Number(loanId))).to.be.true;
            expect(setLoanStatusStub.calledOnceWithExactly(loan, newStatus)).to.be.true;
            expect(updateLoanStub.calledOnceWithExactly(loan)).to.be.true;

        });

        it('should throw BadRequestError if loan does not exist', async () => {
            const loanId = '123';
            const newStatus = 'approved';

            sinon.stub(loanService, 'getLoanById').resolves(null);

            try {
                await loanService.updateLoanStatus(loanId, newStatus);
            } catch (error) {
                expect(error).to.be.instanceOf(BadRequestError);
                expect(error.message).to.equal("loan doesn't exist");
            }
        });
    });

    describe('updateLoanPaidAmount', () => {
        it('should update the paid amount of a loan', async () => {
            const loanId = 123;
            const paidAmount = 100;
            const loan = new Loan();
            loan.id = 123;
            loan.paidAmount = 0;

            const getLoanByIdStub = sinon.stub(loanRepository, 'getLoanById').resolves(loan);
            const setLoanPaidAmountStub = sinon.stub(loanUtils, 'setLoanPaidAmount').resolves();
            const updateLoanStub = sinon.stub(loanRepository, 'updateLoan').resolves();

            const result = await loanService.updateLoanPaidAmount(loanId, paidAmount);

            expect(result).to.deep.equal(loan);
            expect(getLoanByIdStub.calledOnceWithExactly(Number(loanId))).to.be.true;
            expect(setLoanPaidAmountStub.calledOnceWithExactly(loan, paidAmount)).to.be.true;
            expect(updateLoanStub.calledOnceWithExactly(loan)).to.be.true;
        });
    });
});
