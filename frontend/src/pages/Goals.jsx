import { useEffect, useState } from "react";
import { fetchGoals, createGoal, updateGoal, deleteGoal } from "../services/goalService.js";
import { fetchCategories } from "../services/categoryService.js";
import { formatCurrency } from "../utils/format.js";

const EMPTY_FORM = { name: "", targetAmount: "", currentAmount: "0", deadline: "", categoryId: "" };

export default function Goals({ dataVersion, onRefresh }) {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([fetchGoals(), fetchCategories()])
      .then(([goalList, catList]) => {
        setGoals(goalList);
        setCategories(catList);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to load goals");
        setLoading(false);
      });
  }

  useEffect(() => { load(); }, [dataVersion]);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function beginEdit(goal) {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      targetAmount: String(goal.target_amount),
      currentAmount: String(goal.current_amount),
      deadline: goal.deadline ? goal.deadline.slice(0, 10) : "",
      categoryId: goal.category_id || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        targetAmount: form.targetAmount,
        currentAmount: form.currentAmount || "0",
        deadline: form.deadline || undefined,
        categoryId: form.categoryId || undefined
      };

      if (editingId) {
        await updateGoal(editingId, payload);
      } else {
        await createGoal(payload);
      }

      resetForm();
      load();
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || "Unable to save goal");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(goal) {
    if (!window.confirm(`Delete goal "${goal.name}"?`)) return;

    try {
      await deleteGoal(goal.id);
      load();
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || "Unable to delete goal");
    }
  }

  if (loading) return <div className="loading-panel">Loading goals...</div>;
  if (error && !goals.length) return <div className="error-panel">{error}</div>;

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Savings goals</p>
            <h3>{editingId ? "Edit goal" : "New goal"}</h3>
          </div>
        </div>

        <form className="grid-form" onSubmit={handleSubmit}>
          <label className="grid-span-2">
            <span>Goal name</span>
            <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            <span>Target amount</span>
            <input type="number" className="input" min="0.01" step="0.01" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
          </label>
          <label>
            <span>Current amount</span>
            <input type="number" className="input" min="0" step="0.01" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} />
          </label>
          <label>
            <span>Deadline</span>
            <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </label>
          <label>
            <span>Category (optional)</span>
            <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          {error ? <p className="form-error grid-span-2">{error}</p> : null}
          <div className="grid-span-2 row-actions">
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update goal" : "Create goal"}
            </button>
            {editingId ? <button type="button" className="button button-secondary" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>
      </section>

      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Your goals</p>
            <h3>Progress</h3>
          </div>
          <p className="section-note">{goals.length} goals</p>
        </div>

        <div className="goal-list">
          {goals.length ? goals.map((goal) => {
            const target = Number(goal.target_amount) || 1;
            const current = Number(goal.current_amount) || 0;
            const pct = Math.min(100, Math.round((current / target) * 100));
            const remaining = Math.max(0, target - current);

            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <div>
                    <strong>{goal.name}</strong>
                    {goal.category_name ? <span className="goal-category">{goal.category_name}</span> : null}
                  </div>
                  <div className="goal-amounts">
                    <span>{formatCurrency(current)}</span>
                    <span className="goal-of">of</span>
                    <span>{formatCurrency(target)}</span>
                  </div>
                </div>
                <div className="goal-bar-track">
                  <div className="goal-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="goal-footer">
                  <span>{pct}% saved</span>
                  {remaining > 0 ? <span>{formatCurrency(remaining)} remaining</span> : <span className="goal-complete">Complete!</span>}
                  {goal.deadline ? <span>Due {goal.deadline.slice(0, 10)}</span> : null}
                </div>
                <div className="goal-actions">
                  <button type="button" className="text-button" onClick={() => beginEdit(goal)}>Edit</button>
                  <button type="button" className="text-button text-button-danger" onClick={() => handleDelete(goal)}>Delete</button>
                </div>
              </div>
            );
          }) : (
            <div className="empty-state">No savings goals yet. Create one above!</div>
          )}
        </div>
      </section>
    </div>
  );
}
