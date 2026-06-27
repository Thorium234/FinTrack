import {
  createRecurring,
  deleteRecurring,
  findDueRecurring,
  findRecurringById,
  listRecurring,
  updateRecurring
} from "../models/RecurringTransaction.js";
import { createTransaction } from "../models/Transaction.js";
import {
  createHttpError,
  normalizeOptionalText,
  parseDateString,
  parsePositiveNumber
} from "../utils/validation.js";

const VALID_TYPES = ["income", "expense"];
const VALID_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

function addIntervalToDate(dateStr, frequency, intervalValue) {
  const date = new Date(dateStr);
  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + intervalValue);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7 * intervalValue);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + intervalValue);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + intervalValue);
      break;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getUserRecurring(userId) {
  return listRecurring(userId);
}

export async function addRecurring(userId, payload) {
  const amount = parsePositiveNumber(payload.amount, "Amount");

  if (!VALID_TYPES.includes(payload.type)) {
    throw createHttpError("Type must be income or expense", 400);
  }

  if (!VALID_FREQUENCIES.includes(payload.frequency)) {
    throw createHttpError("Frequency must be daily, weekly, monthly, or yearly", 400);
  }

  const nextDate = parseDateString(payload.next_date, "Next date");

  const recurringId = await createRecurring({
    userId,
    categoryId: payload.categoryId || null,
    amount,
    type: payload.type,
    description: normalizeOptionalText(payload.description, "Description") ?? null,
    frequency: payload.frequency,
    intervalValue: payload.interval_value ?? 1,
    nextDate,
    endDate: payload.end_date || null,
    active: payload.active !== undefined ? payload.active : 1
  });

  return findRecurringById(recurringId, userId);
}

export async function editRecurring(userId, id, payload) {
  const existing = await findRecurringById(id, userId);
  if (!existing) {
    throw createHttpError("Recurring transaction not found", 404);
  }

  const updates = {};

  if (payload.amount !== undefined) {
    updates.amount = parsePositiveNumber(payload.amount, "Amount");
  }

  if (payload.categoryId !== undefined) {
    updates.categoryId = payload.categoryId || null;
  }

  if (payload.type !== undefined) {
    if (!VALID_TYPES.includes(payload.type)) {
      throw createHttpError("Type must be income or expense", 400);
    }
    updates.type = payload.type;
  }

  if (payload.description !== undefined) {
    updates.description = normalizeOptionalText(payload.description, "Description") ?? null;
  }

  if (payload.frequency !== undefined) {
    if (!VALID_FREQUENCIES.includes(payload.frequency)) {
      throw createHttpError("Frequency must be daily, weekly, monthly, or yearly", 400);
    }
    updates.frequency = payload.frequency;
  }

  if (payload.interval_value !== undefined) {
    updates.intervalValue = payload.interval_value;
  }

  if (payload.next_date !== undefined) {
    updates.nextDate = parseDateString(payload.next_date, "Next date");
  }

  if (payload.end_date !== undefined) {
    updates.endDate = payload.end_date || null;
  }

  if (payload.active !== undefined) {
    updates.active = payload.active;
  }

  const affectedRows = await updateRecurring(id, userId, updates);
  if (!affectedRows) {
    throw createHttpError("Nothing to update", 400);
  }

  return findRecurringById(id, userId);
}

export async function removeRecurring(userId, id) {
  const existing = await findRecurringById(id, userId);
  if (!existing) {
    throw createHttpError("Recurring transaction not found", 404);
  }

  const affectedRows = await deleteRecurring(id, userId);
  if (!affectedRows) {
    throw createHttpError("Recurring transaction not found", 404);
  }

  return true;
}

export async function processDueRecurring() {
  const dueItems = await findDueRecurring();
  let count = 0;

  for (const item of dueItems) {
    await createTransaction({
      userId: item.user_id,
      categoryId: item.category_id,
      amount: item.amount,
      type: item.type,
      description: item.description,
      transactionDate: item.next_date,
      receiptUrl: null
    });

    const newNextDate = addIntervalToDate(item.next_date, item.frequency, item.interval_value);

    if (item.end_date && newNextDate > item.end_date) {
      await updateRecurring(item.id, item.user_id, {
        nextDate: newNextDate,
        active: 0
      });
    } else {
      await updateRecurring(item.id, item.user_id, {
        nextDate: newNextDate
      });
    }

    count++;
  }

  return count;
}
