import {
  addCategory,
  editCategory,
  getUserCategories,
  removeCategory
} from "../services/category.service.js";
import { findCategoryById } from "../models/Category.js";
import { sendError, sendSuccess } from "../utils/response.js";

export async function listCategories(req, res) {
  try {
    const categories = await getUserCategories(req.user.userId);
    return sendSuccess(res, 200, "Categories retrieved successfully", {
      categories
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function createCategory(req, res) {
  try {
    const category = await addCategory(req.user.userId, req.body);
    return sendSuccess(res, 201, "Category created successfully", {
      category
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function getCategory(req, res) {
  try {
    const categoryId = Number(req.params.id);
    if (!Number.isInteger(categoryId)) {
      return sendError(res, 400, "Invalid category id");
    }

    const category = await findCategoryById(categoryId, req.user.userId);
    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    return sendSuccess(res, 200, "Category retrieved successfully", {
      category
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function updateCategoryById(req, res) {
  try {
    const categoryId = Number(req.params.id);
    if (!Number.isInteger(categoryId)) {
      return sendError(res, 400, "Invalid category id");
    }

    const category = await editCategory(req.user.userId, categoryId, req.body);
    return sendSuccess(res, 200, "Category updated successfully", {
      category
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function deleteCategoryById(req, res) {
  try {
    const categoryId = Number(req.params.id);
    if (!Number.isInteger(categoryId)) {
      return sendError(res, 400, "Invalid category id");
    }

    await removeCategory(req.user.userId, categoryId);
    return sendSuccess(res, 200, "Category deleted successfully");
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}
