import { Op } from 'sequelize';
import { Transaction } from '../../database/models/index.js';
import crypto from 'crypto';

const generateHash = (date, description, amount) => {
  return crypto
    .createHash('md5')
    .update(`${date}-${description.toLowerCase()}-${amount}`)
    .digest('hex');
};

const fuzzyMatch = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return true;
  if (s1.includes(s2) || s2.includes(s1)) return true;
  return false;
};

export const checkDuplicates = async (userId, rows) => {
  const startDate = rows.reduce((min, r) => (r.date < min ? r.date : min), rows[0].date);
  const endDate = rows.reduce((max, r) => (r.date > max ? r.date : max), rows[0].date);

  const existingTransactions = await Transaction.findAll({
    where: {
      userId,
      date: { [Op.gte]: startDate, [Op.lte]: endDate },
    },
  });

  return rows.map((row) => {
    const rowHash = generateHash(row.date, row.description, row.amount);

    // Layer 1 — exact match (same date, description, amount)
    const exactMatch = existingTransactions.find(
      (t) =>
        t.date === row.date &&
        t.title.toLowerCase() === row.description.toLowerCase() &&
        parseFloat(t.amount) === parseFloat(row.amount)
    );
    if (exactMatch) {
      return { ...row, duplicateOf: exactMatch.id, isDuplicate: true, dupType: 'exact' };
    }

    // Layer 2 — fuzzy match (same date, similar description, same amount)
    const fuzzyMatch_ = existingTransactions.find(
      (t) =>
        t.date === row.date &&
        fuzzyMatch(t.title, row.description) &&
        parseFloat(t.amount) === parseFloat(row.amount)
    );
    if (fuzzyMatch_) {
      return { ...row, duplicateOf: fuzzyMatch_.id, isDuplicate: true, dupType: 'fuzzy' };
    }

    // Layer 3 — hash match
    const hashMatch = existingTransactions.find(
      (t) => generateHash(t.date, t.title, t.amount) === rowHash
    );
    if (hashMatch) {
      return { ...row, duplicateOf: hashMatch.id, isDuplicate: true, dupType: 'hash' };
    }

    return { ...row, duplicateOf: null, isDuplicate: false };
  });
};