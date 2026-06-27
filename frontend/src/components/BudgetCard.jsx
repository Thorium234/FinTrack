import { clampPercent, formatCurrency, toPercent } from "../utils/format.js";

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const spent = Number(budget.spent || 0);
  const limit = Number(budget.amount || 0);
  const remaining = Number.isFinite(limit - spent) ? Math.max(limit - spent, 0) : 0;
  const progress = clampPercent(toPercent(spent, limit));

  return (
    <article className={`budget-card ${progress >= 100 ? "is-over" : ""}`}>
      <div className="budget-card-head">
        <div>
          <p className="card-label">{budget.category_name || "Budget"}</p>
          <h3>{formatCurrency(limit)}</h3>
        </div>
        <span className="budget-month">{budget.month}</span>
      </div>

      <div className="budget-meter" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="budget-metrics">
        <div>
          <span>Spent</span>
          <strong>{formatCurrency(spent)}</strong>
        </div>
        <div>
          <span>Remaining</span>
          <strong>{formatCurrency(remaining)}</strong>
        </div>
        <div>
          <span>Usage</span>
          <strong>{Math.round(progress)}%</strong>
        </div>
      </div>

      <div className="row-actions">
        <button type="button" className="text-button" onClick={() => onEdit(budget)}>
          Edit
        </button>
        <button type="button" className="text-button text-danger" onClick={() => onDelete(budget)}>
          Delete
        </button>
      </div>
    </article>
  );
}
