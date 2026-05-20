import * as loanService from './loans.service.js';

export async function listLoans(req, res, next) {
  try {
    const { type } = req.query;
    const loans = await loanService.listLoans(req.user.id, { type });
    res.json({ loans });
  } catch (err) {
    next(err);
  }
}

export async function createLoan(req, res, next) {
  try {
    const loan = await loanService.createLoan(req.user.id, req.body);
    res.status(201).json({ loan });
  } catch (err) {
    next(err);
  }
}

export async function getLoan(req, res, next) {
  try {
    const loan = await loanService.getLoan(req.user.id, req.params.id);
    res.json({ loan });
  } catch (err) {
    next(err);
  }
}

export async function updateLoan(req, res, next) {
  try {
    const loan = await loanService.updateLoan(req.user.id, req.params.id, req.body);
    res.json({ loan });
  } catch (err) {
    next(err);
  }
}

export async function deleteLoan(req, res, next) {
  try {
    const result = await loanService.deleteLoan(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function settleLoan(req, res, next) {
  try {
    const loan = await loanService.settleLoan(req.user.id, req.params.id);
    res.json({ loan });
  } catch (err) {
    next(err);
  }
}