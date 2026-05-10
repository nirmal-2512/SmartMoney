import * as importsService from './imports.service.js';

export const createImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: 'NO_FILE', message: 'No file uploaded' },
      });
    }
    const importRecord = await importsService.createImport(req.user.id, req.file);
    res.status(201).json({ import: importRecord });
  } catch (err) {
    next(err);
  }
};

export const getAllImports = async (req, res, next) => {
  try {
    const imports = await importsService.getAllImports(req.user.id);
    res.status(200).json({ imports });
  } catch (err) {
    next(err);
  }
};

export const getImportById = async (req, res, next) => {
  try {
    const importRecord = await importsService.getImportById(req.user.id, req.params.id);
    res.status(200).json({ import: importRecord });
  } catch (err) {
    next(err);
  }
};

export const getImportRows = async (req, res, next) => {
  try {
    const rows = await importsService.getImportRows(req.user.id, req.params.id);
    res.status(200).json({ rows });
  } catch (err) {
    next(err);
  }
};

export const updateImportRow = async (req, res, next) => {
  try {
    const row = await importsService.updateImportRow(
      req.user.id,
      req.params.id,
      req.params.rowId,
      req.body
    );
    res.status(200).json({ row });
  } catch (err) {
    next(err);
  }
};

export const confirmImport = async (req, res, next) => {
  try {
    const result = await importsService.confirmImport(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteImport = async (req, res, next) => {
  try {
    const result = await importsService.deleteImport(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};