import Decimal from 'decimal.js';
import { Op } from 'sequelize';
import Loan from '../../database/models/Loan.js';

// Returns interest breakdown for a loan record
export function calculateInterest(loan) {
  const principal = new Decimal(loan.principalAmount);
  const rate = new Decimal(loan.interestRate);
  const startDate = new Date(loan.startDate);
  const endDate = loan.status === 'settled' && loan.settledAt
    ? new Date(loan.settledAt)
    : new Date();

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysElapsed = Math.max(
    0,
    Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay)
  );

  const T = new Decimal(daysElapsed).div(365);

  let interestAccrued;
  if (loan.interestType === 'simple') {
    // P * R * T / 100
    interestAccrued = principal.mul(rate).mul(T).div(100);
  } else {
    // Compound: P * (1 + R/100)^T - P
    const base = new Decimal(1).plus(rate.div(100));
    interestAccrued = principal.mul(base.pow(T)).minus(principal);
  }

  const totalOwed = principal.plus(interestAccrued);

  return {
    principal: principal.toDecimalPlaces(2).toNumber(),
    interestAccrued: interestAccrued.toDecimalPlaces(2).toNumber(),
    totalOwed: totalOwed.toDecimalPlaces(2).toNumber(),
    daysElapsed,
  };
}

function enrichLoan(loan) {
  const plain = loan.toJSON ? loan.toJSON() : { ...loan };
  return { ...plain, ...calculateInterest(plain) };
}

function notFound() {
  const err = new Error('Loan not found');
  err.status = 404;
  err.code = 'LOAN_NOT_FOUND';
  throw err;
}

export async function listLoans(userId, { type } = {}) {
  const where = { userId };
  if (type) where.type = type;

  const loans = await Loan.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });

  return loans.map(enrichLoan);
}

export async function createLoan(userId, data) {
  const loan = await Loan.create({ userId, ...data });
  return enrichLoan(loan);
}

export async function getLoan(userId, loanId) {
  const loan = await Loan.findOne({ where: { id: loanId, userId } });
  if (!loan) notFound();
  return enrichLoan(loan);
}

export async function updateLoan(userId, loanId, data) {
  const loan = await Loan.findOne({ where: { id: loanId, userId } });
  if (!loan) notFound();
  await loan.update(data);
  return enrichLoan(loan);
}

export async function deleteLoan(userId, loanId) {
  const loan = await Loan.findOne({ where: { id: loanId, userId } });
  if (!loan) notFound();
  await loan.destroy();
  return { message: 'Loan deleted' };
}

export async function settleLoan(userId, loanId) {
  const loan = await Loan.findOne({ where: { id: loanId, userId } });
  if (!loan) notFound();
  if (loan.status === 'settled') {
    const err = new Error('Loan is already settled');
    err.status = 400;
    err.code = 'LOAN_ALREADY_SETTLED';
    throw err;
  }
  await loan.update({ status: 'settled', settledAt: new Date() });
  return enrichLoan(loan);
}

// Nightly cron helper — mark past-due active loans as overdue
export async function markOverdueLoans() {
  const today = new Date().toISOString().slice(0, 10);
  await Loan.update(
    { status: 'overdue' },
    {
      where: {
        status: 'active',
        dueDate: { [Op.lt]: today },
      },
    }
  );
}