import {
  createCategory,
  deleteCategory,
  findCategoryById,
  findCategoryByName,
  listCategories,
  updateCategory
} from "../models/Category.js";
import {
  createHttpError,
  normalizeOptionalText,
  normalizeRequiredText
} from "../utils/validation.js";

export async function getUserCategories(userId) {
  return listCategories(userId);
}

export async function addCategory(userId, payload) {
  const name = normalizeRequiredText(payload.name, "Category name");

  const existingCategory = await findCategoryByName(name, userId);
  if (existingCategory) {
    throw createHttpError("Category already exists", 409);
  }

  const categoryId = await createCategory({
    userId,
    name,
    color: normalizeOptionalText(payload.color, "Category color") ?? null,
    icon: normalizeOptionalText(payload.icon, "Category icon") ?? null,
    isGlobal: 0
  });

  return findCategoryById(categoryId, userId);
}

export async function editCategory(userId, categoryId, payload) {
  const existingCategory = await findCategoryById(categoryId, userId);
  if (!existingCategory || existingCategory.is_global) {
    throw createHttpError("Category not found", 404);
  }

  const updates = {};

  if (payload.name !== undefined) {
    const name = normalizeRequiredText(payload.name, "Category name");

    const duplicate = await findCategoryByName(name, userId);
    if (duplicate && Number(duplicate.id) !== Number(categoryId)) {
      throw createHttpError("Category already exists", 409);
    }

    updates.name = name;
  }

  if (payload.color !== undefined) {
    updates.color = normalizeOptionalText(payload.color, "Category color") ?? null;
  }

  if (payload.icon !== undefined) {
    updates.icon = normalizeOptionalText(payload.icon, "Category icon") ?? null;
  }

  const affectedRows = await updateCategory(categoryId, userId, updates);
  if (!affectedRows) {
    throw createHttpError("Nothing to update", 400);
  }

  return findCategoryById(categoryId, userId);
}

export async function removeCategory(userId, categoryId) {
  const existingCategory = await findCategoryById(categoryId, userId);
  if (!existingCategory || existingCategory.is_global) {
    throw createHttpError("Category not found", 404);
  }

  const affectedRows = await deleteCategory(categoryId, userId);
  if (!affectedRows) {
    throw createHttpError("Category not found", 404);
  }

  return true;
}
