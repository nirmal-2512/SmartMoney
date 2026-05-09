import * as categoriesService from './categories.service.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoriesService.getAllCategories(req.user.id);
    res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoriesService.getCategoryById(req.user.id, req.params.id);
    res.status(200).json({ category });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoriesService.createCategory(req.user.id, req.body);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoriesService.updateCategory(req.user.id, req.params.id, req.body);
    res.status(200).json({ category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoriesService.deleteCategory(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const seedDefaultCategories = async (req, res, next) => {
  try {
    const categories = await categoriesService.seedDefaultCategories(req.user.id);
    res.status(201).json({ message: 'Default categories created', categories });
  } catch (err) {
    next(err);
  }
};