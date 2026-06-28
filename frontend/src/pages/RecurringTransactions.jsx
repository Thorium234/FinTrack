import { useEffect, useState } from "react";
import {
  fetchRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction
} from "../services/recurringService.js";
import { fetchCategories } from "../services/categoryService.js";
import { formatCurrency } from "../utils/format.js";

const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];
const TYPES = ["income", "expense"];
const EMPTY_FORM = {
  amount: "",
  type: "expense",
  description: "",
  categoryId: "",
  frequency: "monthly",
  intervalValue: "1",
  nextDate: new Date().toISOString().slice(0, 10),
  endDate: ""
};

export default function RecurringTransactions({ dataVersion, onRefresh }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([fetchRecurringTransactions(), fetchCategories()])
      .then(([recurringList, catList]) => {
        setItems(recurringList);
        setCategories(catList);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to load recurring transactions");
        setLoading(false);
      });
  }

  useEffect(() => { load(); }, [dataVersion]);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function beginEdit(item) {
    setEditingId(item.id);
    setForm({
      amount: String(item.amount),
      type: item.type,
      description: item.description || "",
      categoryId: item.category_id || "",
      frequency: item.frequency,
      intervalValue: String(item.interval_value),
      nextDate: item.next_date ? item.next_date.slice(0, 10) : "",
      endDate: item.end_date ? item.end_date.slice(0, 10) : ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        amount: form.amount,
        type: form.type,
        description: form.description || undefined,
        categoryId: form.categoryId || undefined,
        frequency: form.frequency,
        interval_value: form.intervalValue,
        next_date: form.nextDate,
        end_date: form.endDate || undefined
      };

      if (editingId) {
        await updateRecurringTransaction(editingId, payload);
      } else {
        await createRecurringTransaction(payload);
      }

      resetForm();
      load();
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete this recurring "${item.type}" for ${formatCurrency(item.amount)}?`)) return;
    try {
      await deleteRecurringTransaction(item.id);
      load();
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || "Unable to delete");
    }
  }

  async function toggleActive(item) {
    try {
      await updateRecurringTransaction(item.id, { active: item.active ? 0 : 1 });
      load();
    } catch (err) {
      setError(err.message || "Unable to toggle");
    }
  }

  if (loading) return <div className="loading-panel">Loading recurring transactions...</div>;
  if (error && !items.length) return <div className="error-panel">{error}</div>;

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Recurring</p>
            <h3>{editingId ? "Edit template" : "New template"}</h3>
          </div>
        </div>

        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            <span>Amount</span>
            <input type="number" className="input" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </label>
          <label>
            <span>Type</span>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>
            <span>Frequency</span>
            <select className="input" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label>
            <span>Every</span>
            <input type="number" className="input" min="1" value={form.intervalValue} onChange={(e) => setForm({ ...form, intervalValue: e.target.value })} required />
          </label>
          <label>
            <span>Category</span>
            <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>
            <span>Description</span>
            <input type="text" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label>
            <span>Next date</span>
            <input type="date" className="input" value={form.nextDate} onChange={(e) => setForm({ ...form, nextDate: e.target.value })} required />
          </label>
          <label>
            <span>End date (optional)</span>
            <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </label>
          {error ? <p className="form-error grid-span-2">{error}</p> : null}
          <div className="grid-span-2 row-actions">
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Create template"}
            </button>
            {editingId ? <button type="button" className="button button-secondary" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>
      </section>

      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Templates</p>
            <h3>Scheduled transactions</h3>
          </div>
          <p className="section-note">{items.length} templates</p>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Active</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Frequency</th>
                <th>Next</th>
                <th>End</th>
                <th>Category</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map((item) => (
                <tr key={item.id} style={{ opacity: item.active ? 1 : 0.5 }}>
                  <td>
                    <button type="button" className={`pill ${item.active ? "pill-active" : "pill-inactive"}`} onClick={() => toggleActive(item)} style={{ cursor: "pointer" }}>
                      {item.active ? "On" : "Off"}
                    </button>
                  </td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td><span className={`pill ${item.type === "income" ? "pill-income" : "pill-expense"}`}>{item.type}</span></td>
                  <td>Every {item.interval_value} {item.frequency}{item.interval_value > 1 ? "s" : ""}</td>
                  <td>{item.next_date?.slice(0, 10)}</td>
                  <td>{item.end_date ? item.end_date.slice(0, 10) : "-"}</td>
                  <td>{item.category_name || "-"}</td>
                  <td>{item.description || "-"}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="text-button" onClick={() => beginEdit(item)}>Edit</button>
                      <button type="button" className="text-button text-button-danger" onClick={() => handleDelete(item)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9}><div className="empty-state">No recurring templates yet.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
