import { useEffect, useState } from "react";
import ChartCard from "../components/ChartCard.jsx";
import TransactionTable from "../components/TransactionTable.jsx";
import { fetchDashboardSummary } from "../services/dashboardService.js";
import { formatCurrency, formatMonthLabel, toPercent } from "../utils/format.js";

function SummaryCard({ label, value, hint, tone = "neutral" }) {
  return (
    <article className={`summary-card ${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{hint}</span>
    </article>
  );
}

export default function Dashboard({ month, dataVersion, onNavigate }) {
  const [state, setState] = useState({
    loading: true,
    error: "",
    data: null
  });

  useEffect(() => {
    let active = true;
    fetchDashboardSummary(month)
      .then((data) => {
        if (!active) {
          return;
        }
        setState({ loading: false, error: "", data });
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setState({
          loading: false,
          error: error.message || "Unable to load dashboard",
          data: null
        });
      });

    return () => {
      active = false;
    };
  }, [month, dataVersion]);

  if (state.loading) {
    return <div className="loading-panel">Loading dashboard...</div>;
  }

  if (state.error) {
    return <div className="error-panel">{state.error}</div>;
  }

  const { summary, recentTransactions, categoryBreakdown, budgets } = state.data;
  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount || 0), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + Number(budget.spent || 0), 0);
  const budgetProgress = totalBudget ? toPercent(totalSpent, totalBudget) : 0;

  return (
    <div className="page-stack">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Overview</p>
          <h2>Financial pulse for {formatMonthLabel(summary?.month || month)}</h2>
          <p>
            Income, spending, budget usage, and recent activity. Everything is aligned to the
            selected month.
          </p>
        </div>
        <div className="hero-stat">
          <span>Budget usage</span>
          <strong>{Math.round(budgetProgress)}%</strong>
          <small>
            {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
          </small>
        </div>
      </section>

      <section className="summary-grid">
        <SummaryCard
          label="Income"
          value={formatCurrency(summary?.total_income)}
          hint="Recorded for the selected month"
          tone="positive"
        />
        <SummaryCard
          label="Expenses"
          value={formatCurrency(summary?.total_expense)}
          hint="Expense transactions captured"
          tone="warning"
        />
        <SummaryCard
          label="Balance"
          value={formatCurrency(summary?.balance)}
          hint="Income minus expense"
          tone="neutral"
        />
        <SummaryCard
          label="Budget total"
          value={formatCurrency(totalBudget)}
          hint={`${budgets.length} active budgets`}
          tone="accent"
        />
      </section>

      <div className="dashboard-grid">
        <ChartCard title="Spending by category" subtitle="Breakdown">
          {categoryBreakdown.length ? (
            <div className="bar-chart">
              {categoryBreakdown.map((item) => {
                const total = Number(item.total || 0);
                const maxTotal = Math.max(...categoryBreakdown.map((entry) => Number(entry.total || 0)), 1);

                return (
                  <div key={`${item.category_id || item.category_name}`} className="bar-row">
                    <div className="bar-row-head">
                      <span>{item.category_name}</span>
                      <strong>{formatCurrency(total)}</strong>
                    </div>
                    <div className="bar-track">
                      <span style={{ width: `${(total / maxTotal) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No expense breakdown yet.</div>
          )}
        </ChartCard>

        <ChartCard title="Budget usage" subtitle="Pressure">
          {budgets.length ? (
            <div className="budget-mini-list">
              {budgets.map((budget) => (
                <div key={budget.id} className="budget-mini">
                  <div>
                    <strong>{budget.category_name}</strong>
                    <span>
                      {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <small>{Math.round(toPercent(budget.spent, budget.amount))}%</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No budgets for this month.</div>
          )}
        </ChartCard>
      </div>

      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Recent activity</p>
            <h3>Latest transactions</h3>
          </div>
          <button type="button" className="button button-secondary" onClick={() => onNavigate("/transactions")}>
            Open transactions
          </button>
        </div>
        <TransactionTable transactions={recentTransactions} onEdit={() => onNavigate("/transactions")} onDelete={() => {}} />
      </section>
    </div>
  );
}
