import * as loanService from './loans.service.js';

export async function listLoans(req, res, next) {
  try {
    const loans = await loanService.listLoans(req.user.id, { type: req.query.type });
    res.json({ loans });
  } catch (err) { next(err); }
}

export async function createLoan(req, res, next) {
  try {
    const loan = await loanService.createLoan(req.user.id, req.body);
    res.status(201).json({ loan });
  } catch (err) { next(err); }
}

export async function getLoan(req, res, next) {
  try {
    const loan = await loanService.getLoan(req.user.id, req.params.id);
    res.json({ loan });
  } catch (err) { next(err); }
}

export async function updateLoan(req, res, next) {
  try {
    const loan = await loanService.updateLoan(req.user.id, req.params.id, req.body);
    res.json({ loan });
  } catch (err) { next(err); }
}

export async function deleteLoan(req, res, next) {
  try {
    const result = await loanService.deleteLoan(req.user.id, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function settleLoan(req, res, next) {
  try {
    const loan = await loanService.settleLoan(req.user.id, req.params.id);
    res.json({ loan });
  } catch (err) { next(err); }
}

export async function getContacts(req, res, next) {
  try {
    const contacts = await loanService.getContacts(req.user.id);
    res.json({ contacts });
  } catch (err) { next(err); }
}

export async function getLoansByPerson(req, res, next) {
  try {
    const data = await loanService.getLoansByPerson(req.user.id, req.params.personName);
    res.json(data);
  } catch (err) { next(err); }
}