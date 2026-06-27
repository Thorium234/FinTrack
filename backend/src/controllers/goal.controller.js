import {
  addGoal,
  editGoal,
  getUserGoals,
  removeGoal
} from "../services/goal.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

export async function listGoals(req, res) {
  try {
    const goals = await getUserGoals(req.user.userId);
    return sendSuccess(res, 200, "Goals retrieved successfully", {
      goals
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function createGoal(req, res) {
  try {
    const goal = await addGoal(req.user.userId, req.body);
    return sendSuccess(res, 201, "Goal created successfully", {
      goal
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function updateGoalById(req, res) {
  try {
    const goalId = Number(req.params.id);
    if (!Number.isInteger(goalId)) {
      return sendError(res, 400, "Invalid goal id");
    }

    const goal = await editGoal(req.user.userId, goalId, req.body);
    return sendSuccess(res, 200, "Goal updated successfully", {
      goal
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function deleteGoalById(req, res) {
  try {
    const goalId = Number(req.params.id);
    if (!Number.isInteger(goalId)) {
      return sendError(res, 400, "Invalid goal id");
    }

    await removeGoal(req.user.userId, goalId);
    return sendSuccess(res, 200, "Goal deleted successfully");
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}
