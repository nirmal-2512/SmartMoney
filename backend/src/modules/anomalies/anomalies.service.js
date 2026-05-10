import { Op } from 'sequelize';
import {
  Transaction, Category, Budget,
  CategoryBaseline, Anomaly,
} from '../../database/models/index.js';
import { generateContent } from '../ai/gemini.js';

const computeZScore = (value, mean, stdDev) => {
  if (stdDev === 0) return 0;
  return Math.abs((value - mean) / stdDev);
};

const buildBaselines = async (userId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await Transaction.findAll({
    where: {
      userId,
      type: { [Op.in]: ['expense', 'transfer'] },
      date: { [Op.gte]: sixMonthsAgo.toISOString().split('T')[0] },
    },
  });

  const categoryMap = {};
  transactions.forEach((t) => {
    const catId = t.categoryId || 'uncategorised';
    const month = t.date.slice(0, 7);
    const key = `${catId}-${month}`;
    if (!categoryMap[key]) categoryMap[key] = { categoryId: catId, month, amounts: [] };
    categoryMap[key].amounts.push(parseFloat(t.amount));
  });

  const baselines = [];
  for (const [, data] of Object.entries(categoryMap)) {
    const n = data.amounts.length;
    if (n < 3) continue;
    const mean = data.amounts.reduce((a, b) => a + b, 0) / n;
    const variance = data.amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    baselines.push({
      userId,
      categoryId: data.categoryId === 'uncategorised' ? null : data.categoryId,
      month: `${data.month}-01`,
      mean: parseFloat(mean.toFixed(4)),
      stdDev: parseFloat(stdDev.toFixed(4)),
      sampleCount: n,
      computedAt: new Date(),
    });
  }

  if (baselines.length > 0) {
    await CategoryBaseline.bulkCreate(baselines, {
      updateOnDuplicate: ['mean', 'stdDev', 'sampleCount', 'computedAt'],
    });
  }

  return baselines;
};

const getAIExplanation = async (transaction, anomalyType, score) => {
  try {
    const prompt = `
A financial anomaly was detected. Write a single clear sentence explaining why this transaction is flagged.

Transaction: ${transaction.title} - ${transaction.currency} ${transaction.amount} on ${transaction.date}
Anomaly type: ${anomalyType}
Anomaly score: ${score.toFixed(2)}

Return only the explanation sentence, nothing else.
    `.trim();
    return await generateContent(prompt);
  } catch {
    return `Unusual ${anomalyType.replace('_', ' ')} detected for this transaction.`;
  }
};

export const detectAnomalies = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({
    where: { id: transactionId, userId },
    include: [{ model: Category, as: 'Category', attributes: ['name'] }],
  });

  if (!transaction || transaction.type === 'income') return [];

  const anomalies = [];

  // Z-score detection
  const baseline = await CategoryBaseline.findOne({
    where: {
      userId,
      categoryId: transaction.categoryId,
      month: { [Op.lte]: transaction.date },
    },
    order: [['month', 'DESC']],
  });

  if (baseline && baseline.sampleCount >= 3) {
    const zScore = computeZScore(
      parseFloat(transaction.amount),
      parseFloat(baseline.mean),
      parseFloat(baseline.stdDev)
    );

    if (zScore > 2.5) {
      const explanation = await getAIExplanation(transaction, 'z_score', zScore);
      anomalies.push({
        userId,
        transactionId,
        type: 'z_score',
        score: parseFloat(zScore.toFixed(4)),
        explanation,
      });
    }
  }

  // Duplicate proximity detection
  const oneDayAgo = new Date(transaction.date);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const similarRecent = await Transaction.findOne({
    where: {
      userId,
      id: { [Op.ne]: transactionId },
      title: transaction.title,
      amount: transaction.amount,
      date: { [Op.gte]: oneDayAgo.toISOString().split('T')[0] },
    },
  });

  if (similarRecent) {
    anomalies.push({
      userId,
      transactionId,
      type: 'duplicate_proximity',
      score: 1.0,
      explanation: `Possible duplicate: similar transaction to "${transaction.title}" for ${transaction.currency} ${transaction.amount} found within 24 hours.`,
    });
  }

  // Velocity detection
  const last7Days = new Date(transaction.date);
  last7Days.setDate(last7Days.getDate() - 7);

  const recentTransactions = await Transaction.findAll({
    where: {
      userId,
      categoryId: transaction.categoryId,
      type: { [Op.in]: ['expense', 'transfer'] },
      date: { [Op.gte]: last7Days.toISOString().split('T')[0] },
    },
  });

  const weeklyTotal = recentTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (baseline && weeklyTotal > parseFloat(baseline.mean) * 2) {
    const velocityScore = weeklyTotal / parseFloat(baseline.mean);
    anomalies.push({
      userId,
      transactionId,
      type: 'velocity',
      score: parseFloat(velocityScore.toFixed(4)),
      explanation: `Spending velocity alert: ${transaction.Category ? transaction.Category.name : 'this category'} spending is ${velocityScore.toFixed(1)}x higher than usual in the last 7 days.`,
    });
  }

  // Budget projection detection
  if (transaction.categoryId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const budget = await Budget.findOne({
      where: {
        userId,
        categoryId: transaction.categoryId,
        periodStart: { [Op.lte]: endOfMonth },
        periodEnd: { [Op.gte]: startOfMonth },
      },
    });

    if (budget) {
      const monthTransactions = await Transaction.findAll({
        where: {
          userId,
          categoryId: transaction.categoryId,
          type: { [Op.in]: ['expense', 'transfer'] },
          date: { [Op.gte]: startOfMonth, [Op.lte]: endOfMonth },
        },
      });

      const spentSoFar = monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dayOfMonth = now.getDate();
      const projectedTotal = (spentSoFar / dayOfMonth) * daysInMonth;
      const budgetAmount = parseFloat(budget.amount);

      if (projectedTotal > budgetAmount * 1.1) {
        const projectionScore = projectedTotal / budgetAmount;
        anomalies.push({
          userId,
          transactionId,
          type: 'budget_projection',
          score: parseFloat(projectionScore.toFixed(4)),
          explanation: `Budget projection alert: at current spending rate, you will exceed your ${transaction.Category ? transaction.Category.name : 'category'} budget by ${((projectionScore - 1) * 100).toFixed(0)}% this month.`,
        });
      }
    }
  }

  // Save detected anomalies
  if (anomalies.length > 0) {
    await Anomaly.bulkCreate(anomalies, { ignoreDuplicates: true });
  }

  return anomalies;
};

export const getAllAnomalies = async (userId) => {
  return Anomaly.findAll({
    where: { userId, isDismissed: false },
    include: [
      {
        model: Transaction,
        attributes: ['id', 'title', 'amount', 'currency', 'date', 'type'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

export const dismissAnomaly = async (userId, anomalyId) => {
  const anomaly = await Anomaly.findOne({ where: { id: anomalyId, userId } });
  if (!anomaly) {
    const err = new Error('Anomaly not found');
    err.status = 404;
    err.code = 'ANOMALY_NOT_FOUND';
    throw err;
  }
  await anomaly.update({ isDismissed: true });
  return { message: 'Anomaly dismissed' };
};

export const recomputeBaselines = async (userId) => {
  return buildBaselines(userId);
};