import * as budgetsService from './budgets.service.js';

export const getAllBudgets = async (req, res, next) => {
  try {
    const budgets = await budgetsService.getAllBudgets(req.user.id);
    res.status(200).json({ budgets });
  } catch (err) {
    next(err);
  }
};

export const getBudgetById = async (req, res, next) => {
  try {
    const budget = await budgetsService.getBudgetById(req.user.id, req.params.id);
    res.status(200).json({ budget });
  } catch (err) {
    next(err);
  }
};

export const createBudget = async (req, res, next) => {
  try {
    const budget = await budgetsService.createBudget(req.user.id, req.body);
    res.status(201).json({ budget });
  } catch (err) {
    next(err);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const budget = await budgetsService.updateBudget(req.user.id, req.params.id, req.body);
    res.status(200).json({ budget });
  } catch (err) {
    next(err);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const result = await budgetsService.deleteBudget(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getBudgetStatus = async (req, res, next) => {
  try {
    const result = await budgetsService.getBudgetStatus(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};