import Category from '../models/Category.js';
import { generateUniqueSlug } from '../utils/generateSlug.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc   Get all active categories
// @route  GET /api/categories
// @access Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    sendSuccess(res, { categories });
  } catch (err) {
    next(err);
  }
};

// @desc   Create category
// @route  POST /api/categories
// @access Admin+
export const createCategory = async (req, res, next) => {
  try {
    const { name, nameKiny, description, icon, color, parent, order } = req.body;
    const slug = await generateUniqueSlug(name, Category);
    const category = await Category.create({ name, nameKiny, slug, description, icon, color, parent, order });
    sendSuccess(res, { category }, 'Category created.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Update category
// @route  PUT /api/categories/:id
// @access Admin+
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return sendError(res, 'Category not found.', 404);
    sendSuccess(res, { category }, 'Category updated.');
  } catch (err) {
    next(err);
  }
};

// @desc   Delete category
// @route  DELETE /api/categories/:id
// @access Admin+
export const deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    sendSuccess(res, {}, 'Category deleted.');
  } catch (err) {
    next(err);
  }
};
