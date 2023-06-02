import { expect } from 'chai';
import loanUtils from "../../app/utils/loan.utils";
import { LoanStatus } from "../../app/constants/enums/loan.status";
import { Loan } from "../../app/entities/loan.entity";
import { LoanModel } from "../../app/models/loan.model";
import db from '../../app/config/db';
import { Repayment } from '../../app/entities/repayment.entity';

const assert = require('assert');

describe('generateLoanId', function () {
    it('should return the next loan ID', async function () {
        const currentSize = db.loans.size;
        const loanId = await loanUtils.__private__.generateLoanId();
        assert.strictEqual(loanId, currentSize + 1);
    });
});

describe('Loan Functions', function () {
    describe('mapLoanModelToEntity', function () {
        it('should map loanModel properties to loanEntity', async function () {
            const loanEntity = new Loan();
            const loanModel = { id: 1, frequency: 'weekly', loanAmount: 1000, repayments: [] as Repayment[], term: 12, userId: 123 } as unknown as LoanModel;

            await loanUtils.mapLoanModelToEntity(loanEntity, loanModel);

            expect(loanEntity.id).to.equal(loanModel.id);
            expect(loanEntity.paidAmount).to.equal(0);
            expect(loanEntity.frequency).to.equal(loanModel.frequency);
            expect(loanEntity.loanAmount).to.equal(loanModel.loanAmount);
            expect(loanEntity.repayments).to.equal(loanModel.repayments);
            expect(loanEntity.status).to.equal('PENDING');
            expect(loanEntity.term).to.equal(loanModel.term);
            expect(loanEntity.userId).to.equal(loanModel.userId);
        });
    });

    describe('mapRequestBodyToLoanModel', function () {
        it('should map request body properties to loanModel', async function () {
            const reqBody = { frequency: 'monthly', amount: 2000, term: 6, userId: 456 };
            const loanModel = { id: null, frequency: null, loanAmount: null, term: null, userId: null } as LoanModel;

            await loanUtils.mapRequestBodyToLoanModel(reqBody, loanModel);

            expect(loanModel.id).to.not.be.null;
            expect(loanModel.frequency).to.equal(reqBody.frequency);
            expect(loanModel.loanAmount).to.equal(reqBody.amount);
            expect(loanModel.term).to.equal(reqBody.term);
            expect(loanModel.userId).to.equal(reqBody.userId);
        });

        it('should set default frequency if not provided in request body', async function () {
            const reqBody = { amount: 2000, term: 6, userId: 456 };
            const loanModel = { id: null, frequency: null, loanAmount: null, term: null, userId: null } as LoanModel;

            await loanUtils.mapRequestBodyToLoanModel(reqBody, loanModel);

            expect(loanModel.frequency).to.equal('WEEKLY');
        });
    });

    describe('setLoanStatus', function () {
        it('should set loan status based on the action', async function () {
            const loan = new Loan();
            loan.status = null;
            const action = 'approve';

            await loanUtils.setLoanStatus(loan, action);

            expect(loan.status).to.equal('APPROVED');
        });

        it('should set loan status to PAID for action "paid"', async function () {
            const loan = new Loan();
            loan.status = null;
            const action = 'paid';

            await loanUtils.setLoanStatus(loan, action);

            expect(loan.status).to.equal('PAID');
        });

        it('should not change loan status for unrecognized action', async function () {
            const loan = new Loan();
            loan.status = LoanStatus.PENDING;
            const action = 'invalid';

            await loanUtils.setLoanStatus(loan, action);

            expect(loan.status).to.equal('PENDING');
        });
    });

    describe('setLoanPaidAmount', function () {
        it('should increase loan paidAmount by the specified amount', async function () {
            const loan = new Loan();
            loan.paidAmount = 500;
            const amount = 300;

            await loanUtils.setLoanPaidAmount(loan, amount);

            expect(loan.paidAmount).to.equal(800);
        });
    });
});
