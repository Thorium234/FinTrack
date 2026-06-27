import { useEffect, useState } from "react";
import BudgetCard from "../components/BudgetCard.jsx";
import { fetchCategories } from "../services/categoryService.js";
import {
  createBudget,
  deleteBudget,
  fetchBudgets,
  updateBudget
} from "../services/budgetService.js";
import { toMonthInputValue } from "../utils/format.js";

const EMPTY_FORM = {
  categoryId: "",
  amount: "",
  month: toMonthInputValue()
};

export default function Budgets({ month, dataVersion, onRefresh }) {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM, month });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([fetchBudgets(month), fetchCategories()])
      .then(([budgetList, categoryList]) => {
        if (!active) {
          return;
        }
        setBudgets(budgetList);
        setCategories(categoryList);
        setForm((current) => ({ ...current, month }));
        setLoading(false);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err.message || "Unable to load budgets");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [month, dataVersion]);

  function resetForm() {
    setEditingId(null);
    setForm({
      categoryId: "",
      amount: "",
      month
    });
  }

  function beginEdit(budget) {
    setEditingId(budget.id);
    setForm({
      categoryId: budget.category_id,
      amount: String(budget.amount ?? ""),
      month: budget.month
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        categoryId: form.categoryId,
        amount: form.amount,
        month: form.month
      };

      if (editingId) {
        await updateBudget(editingId, payload);
      } else {
        await createBudget(payload);
      }

      const budgetList = await fetchBudgets(month);
      setBudgets(budgetList);
      resetForm();
      onRefresh();
    } catch (err) {
      setError(err.message || "Unable to save budget");
    }
  }

  async function handleDelete(budget) {
    if (!window.confirm(`Delete budget ${budget.id}?`)) {
      return;
    }

    try {
      await deleteBudget(budget.id);
      setBudgets((current) => current.filter((item) => item.id !== budget.id));
      onRefresh();
    } catch (err) {
      setError(err.message || "Unable to delete budget");
    }
  }

  if (loading) {
    return <div className="loading-panel">Loading budgets...</div>;
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Budget editor</p>
            <h3>{editingId ? "Edit budget" : "Create budget"}</h3>
          </div>
          {editingId ? (
            <button type="button" className="button button-secondary" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </div>

        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            <span>Category</span>
            <select
              value={form.categoryId}
              onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              required
            />
          </label>
          <label>
            <span>Month</span>
            <input
              type="month"
              value={form.month}
              onChange={(event) => setForm({ ...form, month: event.target.value })}
              required
            />
          </label>
          {error ? <p className="form-error grid-span-2">{error}</p> : null}
          <div className="grid-span-2 form-actions">
            <button type="submit" className="button button-primary">
              {editingId ? "Update budget" : "Save budget"}
            </button>
            <button type="button" className="button button-secondary" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Budget coverage</p>
            <h3>Monthly limits</h3>
          </div>
          <p className="section-note">{budgets.length} budgets</p>
        </div>
        <div className="budget-grid">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onEdit={beginEdit} onDelete={handleDelete} />
          ))}
        </div>
        {!budgets.length ? <div className="empty-state">No budgets for this month.</div> : null}
      </section>
    </div>
  );
}
