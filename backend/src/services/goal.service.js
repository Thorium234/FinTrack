import {
  createGoal,
  deleteGoal,
  findGoalById,
  listGoals,
  updateGoal
} from "../models/Goal.js";
import {
  createHttpError,
  normalizeRequiredText,
  parsePositiveNumber
} from "../utils/validation.js";

export async function getUserGoals(userId) {
  return listGoals(userId);
}

export async function addGoal(userId, payload) {
  const name = normalizeRequiredText(payload.name, "Goal name");
  const targetAmount = parsePositiveNumber(payload.targetAmount, "Target amount");

  let currentAmount = 0;
  if (payload.currentAmount !== undefined && payload.currentAmount !== null) {
    currentAmount = parsePositiveNumber(payload.currentAmount, "Current amount");
  }

  let deadline = null;
  if (payload.deadline !== undefined && payload.deadline !== null && payload.deadline !== "") {
    if (typeof payload.deadline !== "string" || Number.isNaN(Date.parse(payload.deadline))) {
      throw createHttpError("A valid deadline date is required", 400);
    }
    deadline = payload.deadline;
  }

  let categoryId = null;
  if (payload.categoryId !== undefined && payload.categoryId !== null && payload.categoryId !== "") {
    categoryId = Number(payload.categoryId);
    if (!Number.isInteger(categoryId)) {
      throw createHttpError("Category id must be a valid number", 400);
    }
  }

  const goalId = await createGoal({
    userId,
    name,
    targetAmount,
    currentAmount,
    deadline,
    categoryId
  });

  return findGoalById(goalId, userId);
}

export async function editGoal(userId, goalId, payload) {
  const existingGoal = await findGoalById(goalId, userId);
  if (!existingGoal) {
    throw createHttpError("Goal not found", 404);
  }

  const updates = {};

  if (payload.name !== undefined) {
    updates.name = normalizeRequiredText(payload.name, "Goal name");
  }

  if (payload.targetAmount !== undefined) {
    updates.targetAmount = parsePositiveNumber(payload.targetAmount, "Target amount");
  }

  if (payload.currentAmount !== undefined) {
    updates.currentAmount = parsePositiveNumber(payload.currentAmount, "Current amount");
  }

  if (payload.deadline !== undefined) {
    if (payload.deadline === null || payload.deadline === "") {
      updates.deadline = null;
    } else {
      if (typeof payload.deadline !== "string" || Number.isNaN(Date.parse(payload.deadline))) {
        throw createHttpError("A valid deadline date is required", 400);
      }
      updates.deadline = payload.deadline;
    }
  }

  if (payload.categoryId !== undefined) {
    if (payload.categoryId === null || payload.categoryId === "") {
      updates.categoryId = null;
    } else {
      const parsedId = Number(payload.categoryId);
      if (!Number.isInteger(parsedId)) {
        throw createHttpError("Category id must be a valid number", 400);
      }
      updates.categoryId = parsedId;
    }
  }

  const affectedRows = await updateGoal(goalId, userId, updates);
  if (!affectedRows) {
    throw createHttpError("Nothing to update", 400);
  }

  return findGoalById(goalId, userId);
}

export async function removeGoal(userId, goalId) {
  const existingGoal = await findGoalById(goalId, userId);
  if (!existingGoal) {
    throw createHttpError("Goal not found", 404);
  }

  const affectedRows = await deleteGoal(goalId, userId);
  if (!affectedRows) {
    throw createHttpError("Goal not found", 404);
  }

  return true;
}
