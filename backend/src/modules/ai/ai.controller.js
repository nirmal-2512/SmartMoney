import * as chatService from './chat.service.js';
import * as reportService from './report.service.js';
import * as categorisationService from './categorisation.service.js';

export const chat = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        error: { code: 'MISSING_MESSAGE', message: 'message is required' },
      });
    }

    const response = await chatService.chat(
      req.user.id,
      message,
      conversationHistory || []
    );

    res.status(200).json({ response, role: 'assistant' });
  } catch (err) {
    next(err);
  }
};

export const generateMonthlyReport = async (req, res, next) => {
  try {
    const month = req.params.month;
    const report = await reportService.generateMonthlyReport(req.user.id, month);
    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
};

export const getMonthlyReport = async (req, res, next) => {
  try {
    const month = req.params.month;
    const report = await reportService.getMonthlyReport(req.user.id, month);
    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
};

export const categoriseTransaction = async (req, res, next) => {
  try {
    const { description, amount, type } = req.body;

    if (!description || !type) {
      return res.status(400).json({
        error: { code: 'MISSING_PARAMS', message: 'description and type are required' },
      });
    }

    const result = await categorisationService.categoriseTransaction(
      req.user.id,
      description,
      amount || 0,
      type
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};