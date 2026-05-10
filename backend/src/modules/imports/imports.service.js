import { Import, ImportRow, Transaction, Category } from '../../database/models/index.js';
import { parseCSV, normaliseCSVRow } from './csv.service.js';
import { extractTextFromPDF, parsePDFWithAI } from './pdf.service.js';
import { checkDuplicates } from './dedup.service.js';
import { categoriseMultiple } from '../ai/categorisation.service.js';

export const createImport = async (userId, file) => {
  const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'csv';

  const importRecord = await Import.create({
    userId,
    fileName: file.originalname,
    fileType,
    status: 'processing',
  });

  try {
    let rows = [];

    if (fileType === 'csv') {
      const records = parseCSV(file.buffer);
      rows = records.map(normaliseCSVRow).filter(Boolean);
    } else {
      const text = await extractTextFromPDF(file.buffer);
      rows = await parsePDFWithAI(text);
    }

    if (rows.length === 0) {
      await importRecord.update({ status: 'failed', errorMessage: 'No valid transactions found in file' });
      return importRecord;
    }

    // Check duplicates
    const rowsWithDupCheck = await checkDuplicates(userId, rows);

    // AI categorise non-duplicate rows
    const nonDupRows = rowsWithDupCheck.filter((r) => !r.isDuplicate);
    let categorised = [];
    try {
      categorised = await categoriseMultiple(userId, nonDupRows);
    } catch {
      categorised = nonDupRows.map((r) => ({
        ...r,
        categoryId: null,
        confidence: 0,
        needsReview: true,
      }));
    }

    const categorisedMap = {};
    categorised.forEach((r) => {
      categorisedMap[`${r.date}-${r.description}-${r.amount}`] = r;
    });

    // Create import rows
    const importRowsData = rowsWithDupCheck.map((row) => {
      const key = `${row.date}-${row.description}-${row.amount}`;
      const cat = categorisedMap[key];

      return {
        importId: importRecord.id,
        date: row.date,
        description: row.description,
        amount: row.amount,
        currency: row.currency || 'INR',
        type: row.type,
        suggestedCategoryId: cat ? cat.categoryId : null,
        confidence: cat ? cat.confidence : null,
        needsReview: row.isDuplicate ? true : (cat ? cat.needsReview : true),
        duplicateOf: row.duplicateOf || null,
        status: row.isDuplicate ? 'skipped' : 'pending',
        rawData: row.rawData || {},
      };
    });

    await ImportRow.bulkCreate(importRowsData);

    const totalRows = importRowsData.length;
    const skippedRows = importRowsData.filter((r) => r.status === 'skipped').length;

    await importRecord.update({
      status: 'staged',
      totalRows,
      skippedRows,
    });

  } catch (err) {
    await importRecord.update({ status: 'failed', errorMessage: err.message });
    throw err;
  }

  return importRecord;
};

export const getAllImports = async (userId) => {
  return Import.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
};

export const getImportById = async (userId, importId) => {
  const importRecord = await Import.findOne({ where: { id: importId, userId } });
  if (!importRecord) {
    const err = new Error('Import not found');
    err.status = 404;
    err.code = 'IMPORT_NOT_FOUND';
    throw err;
  }
  return importRecord;
};

export const getImportRows = async (userId, importId) => {
  await getImportById(userId, importId);

  return ImportRow.findAll({
    where: { importId },
    include: [
      { model: Category, as: 'suggestedCategory', attributes: ['id', 'name', 'icon', 'color'] },
      { model: Category, as: 'finalCategory', attributes: ['id', 'name', 'icon', 'color'] },
    ],
    order: [['createdAt', 'ASC']],
  });
};

export const updateImportRow = async (userId, importId, rowId, { finalCategoryId }) => {
  await getImportById(userId, importId);

  const row = await ImportRow.findOne({ where: { id: rowId, importId } });
  if (!row) {
    const err = new Error('Import row not found');
    err.status = 404;
    err.code = 'ROW_NOT_FOUND';
    throw err;
  }

  await row.update({ finalCategoryId, needsReview: false });
  return row;
};

export const confirmImport = async (userId, importId) => {
  const importRecord = await getImportById(userId, importId);

  if (importRecord.status !== 'staged') {
    const err = new Error('Import is not in staged status');
    err.status = 400;
    err.code = 'INVALID_STATUS';
    throw err;
  }

  const rows = await ImportRow.findAll({
    where: { importId, status: 'pending' },
  });

  const transactions = rows.map((row) => ({
    userId,
    categoryId: row.finalCategoryId || row.suggestedCategoryId || null,
    title: row.description,
    amount: row.amount,
    currency: row.currency,
    amountBase: row.amount,
    baseCurrency: process.env.BASE_CURRENCY || 'INR',
    exchangeRate: 1,
    type: row.type,
    date: row.date,
    importRowId: row.id,
  }));

  await Transaction.bulkCreate(transactions);

  await ImportRow.update(
    { status: 'confirmed' },
    { where: { importId, status: 'pending' } }
  );

  await importRecord.update({
    status: 'confirmed',
    confirmedRows: transactions.length,
  });

  return {
    message: `${transactions.length} transactions imported successfully`,
    importedCount: transactions.length,
  };
};

export const deleteImport = async (userId, importId) => {
  const importRecord = await getImportById(userId, importId);
  await importRecord.destroy();
  return { message: 'Import deleted successfully' };
};