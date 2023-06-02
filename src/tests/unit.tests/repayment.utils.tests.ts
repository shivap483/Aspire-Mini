import { expect } from 'chai';
import db from '../../app/config/db';
import repaymentUtils from '../../app/utils/repayment.utils';
import { Repayment } from '../../app/entities/repayment.entity';
import { RepaymentModel } from '../../app/models/repayment.model';
import sinon from 'sinon';
import { LoanFrequency } from '../../app/constants/enums/loan.frequency';

describe('Repayment Utils tests', function () {
  describe('getFrequency', function () {
    it('should return 7 for weekly frequency', async function () {
      const frequency = await repaymentUtils.getFrequency(LoanFrequency.WEEKLY);
      expect(frequency).to.equal(7);
    });

    it('should return 30 for monthly frequency', async function () {
      const frequency = await repaymentUtils.getFrequency(LoanFrequency.MONTHLY);
      expect(frequency).to.equal(30);
    });

    it('should return 7 for unrecognized frequency', async function () {
      const frequency = await repaymentUtils.getFrequency('unknown' as LoanFrequency);
      expect(frequency).to.equal(7);
    });
  });

  describe('mapRepamentModelToEntity', function () {
    it('should map repaymentModel properties to repaymentEntity', async function () {
      const model = { loanId: 1, amount: 1000, date: '2023-06-01', status: 'pending' } as unknown as RepaymentModel;
      const entity = new Repayment();

      await repaymentUtils.mapRepamentModelToEntity(model, entity);

      expect(entity.id).to.not.be.null;
      expect(entity.loanId).to.equal(model.loanId);
      expect(entity.repaymentAmount).to.equal(model.amount);
      expect(entity.paidAmount).to.equal(0);
      expect(entity.repaymentDate).to.equal(model.date);
      expect(entity.status).to.equal(model.status);
    });
  });

  describe('getRepaymentId', function () {
    it('should return the next available repayment ID', async function () {
      sinon.stub(db.repayments, 'size').value(10);

      const repaymentId = await repaymentUtils.__private__.getRepaymentId();

      expect(repaymentId).to.equal(11);

      sinon.restore();
    });
  });

  describe('getLatestPendingRepayment', function () {
    it('should return the latest pending repayment', async function () {
      const repayments = [
        { repaymentDate: new Date('2023-06-01'), status: 'PAID' },
        { repaymentDate: new Date('2023-06-02'), status: 'PENDING' },
        { repaymentDate: new Date('2023-06-03'), status: 'PENDING' }
      ] as Repayment[];

      const latestPendingRepayment = await repaymentUtils.getLatestPendingRepayment(repayments);

      expect(latestPendingRepayment).to.deep.equal({ repaymentDate: new Date('2023-06-02'), status: 'PENDING' });
    });

    it('should return null if there are no pending repayments', async function () {
      const repayments = [
        { repaymentDate: new Date('2023-06-01'), status: 'PAID' } as unknown as Repayment,
        { repaymentDate: new Date('2023-06-02'), status: 'PAID' },
        { repaymentDate: new Date('2023-06-03'), status: 'PAID' }
      ] as Repayment[];

      const latestPendingRepayment = await repaymentUtils.getLatestPendingRepayment(repayments);

      expect(latestPendingRepayment).to.be.null;
    });
  });

  describe('checkRepaymentsDone', function () {
    it('should return false if there are pending repayments', async function () {
      const repayments = [
        { status: 'PAID' },
        { status: 'PENDING' },
        { status: 'PAID' }
      ] as Repayment[];

      const result = await repaymentUtils.checkRepaymentsDone(repayments);

      expect(result).to.be.false;
    });

    it('should return true if all repayments are paid', async function () {
      const repayments = [
        { status: 'paid' } as unknown as Repayment,
        { status: 'paid' },
        { status: 'paid' }
      ] as Repayment[];

      const result = await repaymentUtils.checkRepaymentsDone(repayments);

      expect(result).to.be.true;
    });
  });

  describe('getPendingRepayments', function () {
    it('should return an array of pending repayments', async function () {
      const date = new Date()
      const repayments = [
        { status: 'PAID', repaymentDate: date },
        { status: 'PENDING', repaymentDate: date },
        { status: 'PENDING', repaymentDate: date }
      ] as Repayment[];

      const pendingRepayments = await repaymentUtils.getPendingRepayments(repayments);

      expect(pendingRepayments).to.deep.equal([
        { status: 'PENDING', repaymentDate: date },
        { status: 'PENDING', repaymentDate: date }
      ]);
    });

    it('should return an empty array if there are no pending repayments', async function () {
      const repayments = [
        { status: 'PAID', repaymentDate: new Date() },
        { status: 'PAID', repaymentDate: new Date() },
        { status: 'PAID', repaymentDate: new Date() },
      ] as Repayment[];

      const pendingRepayments = await repaymentUtils.getPendingRepayments(repayments);

      expect(pendingRepayments).to.deep.equal([]);
    });
  });
});
