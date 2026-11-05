import Category from '../models/Category.js';
import Article from '../models/Article.js';
import Video from '../models/Video.js';
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
    const allowed = ['name', 'nameKiny', 'description', 'icon', 'color', 'parent', 'order', 'isActive'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (updates.name && updates.name !== (await Category.findById(req.params.id).select('name'))?.name) updates.slug = await generateUniqueSlug(updates.name, Category, req.params.id);
    const category = await Category.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
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
    const category = await Category.findById(req.params.id);
    if (!category) return sendError(res, 'Category not found.', 404);
    const [articleExists, videoExists, childExists] = await Promise.all([
      Article.exists({ category: category._id }), Video.exists({ category: category._id }), Category.exists({ parent: category._id }),
    ]);
    if (articleExists || videoExists || childExists) return sendError(res, 'This category is in use. Deactivate it instead of deleting it.', 409);
    await category.deleteOne();
    sendSuccess(res, {}, 'Category deleted.');
  } catch (err) {
    next(err);
  }
};
