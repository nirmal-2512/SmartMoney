import { Category } from '../../database/models/index.js';

export const getAllCategories = async (userId) => {
  const categories = await Category.findAll({
    where: { userId },
    order: [['createdAt', 'ASC']],
  });
  return categories;
};

export const getCategoryById = async (userId, categoryId) => {
  const category = await Category.findOne({
    where: { id: categoryId, userId },
  });
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    err.code = 'CATEGORY_NOT_FOUND';
    throw err;
  }
  return category;
};

export const createCategory = async (userId, data) => {
  const existing = await Category.findOne({
    where: { userId, name: data.name, type: data.type },
  });
  if (existing) {
    const err = new Error('Category with this name already exists');
    err.status = 409;
    err.code = 'CATEGORY_EXISTS';
    throw err;
  }
  const category = await Category.create({ ...data, userId });
  return category;
};

export const updateCategory = async (userId, categoryId, data) => {
  const category = await Category.findOne({
    where: { id: categoryId, userId },
  });
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    err.code = 'CATEGORY_NOT_FOUND';
    throw err;
  }

  if (category.isDefault) {
    const err = new Error('Default categories cannot be modified');
    err.status = 403;
    err.code = 'CANNOT_MODIFY_DEFAULT';
    throw err;
  }

  await category.update(data);
  return category;
};

export const deleteCategory = async (userId, categoryId) => {
  const category = await Category.findOne({
    where: { id: categoryId, userId },
  });
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    err.code = 'CATEGORY_NOT_FOUND';
    throw err;
  }

  if (category.isDefault) {
    const err = new Error('Default categories cannot be deleted');
    err.status = 403;
    err.code = 'CANNOT_DELETE_DEFAULT';
    throw err;
  }

  await category.destroy();
  return { message: 'Category deleted successfully' };
};

export const seedDefaultCategories = async (userId) => {
  const defaults = [
    { name: 'Salary', icon: 'briefcase', color: '#22c55e', type: 'income' },
    { name: 'Freelance', icon: 'laptop', color: '#10b981', type: 'income' },
    { name: 'Investment', icon: 'trending-up', color: '#6366f1', type: 'income' },
    { name: 'Other Income', icon: 'plus-circle', color: '#84cc16', type: 'income' },
    { name: 'Food & Dining', icon: 'utensils', color: '#f97316', type: 'expense' },
    { name: 'Transport', icon: 'car', color: '#3b82f6', type: 'expense' },
    { name: 'Shopping', icon: 'shopping-bag', color: '#ec4899', type: 'expense' },
    { name: 'Entertainment', icon: 'film', color: '#8b5cf6', type: 'expense' },
    { name: 'Health', icon: 'heart', color: '#ef4444', type: 'expense' },
    { name: 'Utilities', icon: 'zap', color: '#f59e0b', type: 'expense' },
    { name: 'Rent', icon: 'home', color: '#06b6d4', type: 'expense' },
    { name: 'Education', icon: 'book', color: '#6366f1', type: 'expense' },
    { name: 'Other Expense', icon: 'minus-circle', color: '#94a3b8', type: 'expense' },
  ];

  const categories = await Category.bulkCreate(
    defaults.map((cat) => ({ ...cat, userId, isDefault: true })),
    { ignoreDuplicates: true }
  );
  return categories;
};