import Decimal from 'decimal.js';
import { Op } from 'sequelize';
import { Loan, Transaction, Category } from '../../database/models/index.js';

export function calculateInterest(loan) {
  const principal = new Decimal(loan.principalAmount);
  const rate = new Decimal(loan.interestRate);
  const startDate = new Date(loan.startDate);
  const endDate =
    loan.status === 'settled' && loan.settledAt
      ? new Date(loan.settledAt)
      : new Date();

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysElapsed = Math.max(
    0,
    Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay)
  );
  const T = new Decimal(daysElapsed).div(365);

  const interestAccrued =
    loan.interestType === 'simple'
      ? principal.mul(rate).mul(T).div(100)
      : principal.mul(new Decimal(1).plus(rate.div(100)).pow(T)).minus(principal);

  return {
    principal: principal.toDecimalPlaces(2).toNumber(),
    interestAccrued: interestAccrued.toDecimalPlaces(2).toNumber(),
    totalOwed: principal.plus(interestAccrued).toDecimalPlaces(2).toNumber(),
    daysElapsed,
  };
}

function enrich(loan) {
  const plain = loan.toJSON ? loan.toJSON() : { ...loan };
  return { ...plain, ...calculateInterest(plain) };
}

function notFound() {
  const err = new Error('Loan not found');
  err.status = 404;
  err.code = 'LOAN_NOT_FOUND';
  throw err;
}

// Find or create a Loans category for the user
async function getLoansCategory(userId, type) {
  const name = type === 'given' ? 'Loan Given' : 'Loan Taken';
  const transactionType = type === 'given' ? 'expense' : 'income';

  let category = await Category.findOne({
    where: { userId, name, deletedAt: null },
  });

  if (!category) {
    category = await Category.create({
      userId,
      name,
      icon: '🤝',
      color: type === 'given' ? '#FF6B6B' : '#00C896',
      type: transactionType,
      isDefault: false,
    });
  }

  return category;
}

// Create a transaction linked to the loan
async function createLoanTransaction(userId, loan) {
  const category = await getLoansCategory(userId, loan.type);

  const transactionType = loan.type === 'given' ? 'expense' : 'income';

  const transaction = await Transaction.create({
    userId,
    categoryId: category.id,
    title: `Loan ${loan.type === 'given' ? 'given to' : 'taken from'} ${loan.personName}`,
    amount: loan.principalAmount,
    currency: loan.currency,
    amountBase: loan.principalAmount,
    baseCurrency: loan.currency,
    exchangeRate: 1,
    rateSource: 'manual',
    type: transactionType,
    date: loan.startDate,
    notes: `Auto-created from loan record. ${loan.notes || ''}`.trim(),
  });

  return transaction;
}

// Create a reverse transaction when loan is settled
async function createSettlementTransaction(userId, loan) {
  const category = await getLoansCategory(userId, loan.type);

  // Reverse type — if loan was given (expense), settlement is income
  const transactionType = loan.type === 'given' ? 'income' : 'expense';
  const { totalOwed } = calculateInterest(loan);

  await Transaction.create({
    userId,
    categoryId: category.id,
    title: `Loan settled — ${loan.personName}`,
    amount: totalOwed,
    currency: loan.currency,
    amountBase: totalOwed,
    baseCurrency: loan.currency,
    exchangeRate: 1,
    rateSource: 'manual',
    type: transactionType,
    date: new Date().toISOString().slice(0, 10),
    notes: `Loan settlement including interest.`,
  });
}

export async function listLoans(userId, { type } = {}) {
  const where = { userId };
  if (type) where.type = type;
  const loans = await Loan.findAll({ where, order: [['createdAt', 'DESC']] });
  return loans.map(enrich);
}

export async function createLoan(userId, data) {
  const loan = await Loan.create({ userId, ...data });

  // Create linked transaction
  const transaction = await createLoanTransaction(userId, loan);
  await loan.update({ transactionId: transaction.id });

  return enrich(loan);
}

export async function getLoan(userId, loanId) {
  const loan = await Loan.findOne({ where: { id: loanId, userId } });
  if (!loan) notFound();
  return enrich(loan);
}

export async function updateLoan(userId, loanId, data) {
  const loan = await Loan.findOne({ where: { id: loanId, userId } });
  if (!loan) notFound();
  await loan.update(data);

  // Update the linked transaction amount if principal changed
  if (data.principalAmount && loan.transactionId) {
    await Transaction.update(
      { amount: data.principalAmount, amountBase: data.principalAmount },
      { where: { id: loan.transactionId } }
    );
  }

  return enrich(loan);
}

export async function deleteLoan(userId, loanId) {
  const loan = await Loan.findOne({ where: { id: loanId, userId } });
  if (!loan) notFound();

  // Do NOT delete the linked transaction — just unlink it
  if (loan.transactionId) {
    await Transaction.update(
      { notes: 'Loan record deleted, transaction kept for records.' },
      { where: { id: loan.transactionId } }
    );
  }

  await loan.destroy();
  return { message: 'Loan deleted' };
}

// Get all unique contacts with net balance
export async function getContacts(userId) {
  const loans = await Loan.findAll({ where: { userId } });

  const grouped = {};
  for (const loan of loans) {
    const plain = loan.toJSON();
    const { totalOwed } = calculateInterest(plain);

    if (!grouped[plain.personName]) {
      grouped[plain.personName] = {
        personName: plain.personName,
        netBalance: 0, // positive = they owe you, negative = you owe them
        entryCount: 0,
        currency: plain.currency,
      };
    }

    grouped[plain.personName].entryCount += 1;

    if (plain.status !== 'settled') {
      if (plain.type === 'given') {
        grouped[plain.personName].netBalance += totalOwed;
      } else {
        grouped[plain.personName].netBalance -= totalOwed;
      }
    }
  }

  return Object.values(grouped).sort((a, b) => a.personName.localeCompare(b.personName));
}

// Get all loan entries for one person
export async function getLoansByPerson(userId, personName) {
  const loans = await Loan.findAll({
    where: { userId, personName },
    order: [['startDate', 'ASC']],
  });

  let runningBalance = 0;
  const entries = loans.map((loan) => {
    const enriched = enrich(loan);
    if (enriched.status !== 'settled') {
      runningBalance += enriched.type === 'given' ? enriched.totalOwed : -enriched.totalOwed;
    }
    return enriched;
  });

  return { personName, entries, netBalance: runningBalance };
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

  // Create settlement (reverse) transaction
  await createSettlementTransaction(userId, loan);

  return enrich(loan);
}