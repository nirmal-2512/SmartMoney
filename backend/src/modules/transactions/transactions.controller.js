import * as transactionsService from './transactions.service.js';

import { uploadReceipt } from '../../common/utils/uploadReceipt.js';

export const uploadTransactionReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: 'NO_FILE', message: 'No receipt image uploaded' },
      });
    }

    const transaction = await transactionsService.getTransactionById(req.user.id, req.params.id);
    const receiptUrl = await uploadReceipt(req.file.buffer, req.file.originalname);
    const updated = await transactionsService.updateTransaction(req.user.id, req.params.id, { receiptUrl });

    res.status(200).json({ receiptUrl, transaction: updated });
  } catch (err) {
    next(err);
  }
};

export const getAllTransactions = async (req, res, next) => {
  try {
    const result = await transactionsService.getAllTransactions(req.user.id, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionsService.getTransactionById(req.user.id, req.params.id);
    res.status(200).json({ transaction });
  } catch (err) {
    next(err);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionsService.createTransaction(req.user.id, req.body);
    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionsService.updateTransaction(req.user.id, req.params.id, req.body);
    res.status(200).json({ transaction });
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const result = await transactionsService.deleteTransaction(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getTransactionSummary = async (req, res, next) => {
  try {
    const result = await transactionsService.getTransactionSummary(req.user.id, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};