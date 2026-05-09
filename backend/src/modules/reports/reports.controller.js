import * as reportsService from './reports.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const result = await reportsService.getDashboard(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getMonthlyReport = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const result = await reportsService.getMonthlyReport(req.user.id, month);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const result = await reportsService.getCategoryBreakdown(req.user.id, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};