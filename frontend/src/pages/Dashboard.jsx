import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
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

const PIE_COLORS = ["#6cd4a8", "#f0b35d", "#f16b5e", "#8bcfff", "#a855f7", "#14b8a6", "#f43f5e", "#6366f1"];

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

  const breakdownData = [...categoryBreakdown]
    .sort((a, b) => Number(b.total) - Number(a.total))
    .map((item) => ({
      name: item.category_name,
      value: Number(item.total || 0)
    }));

  const budgetPieData = budgets
    .map((budget) => ({
      name: budget.category_name,
      spent: Number(budget.spent || 0),
      remaining: Math.max(0, Number(budget.amount || 0) - Number(budget.spent || 0))
    }))
    .filter((b) => b.spent > 0 || b.remaining > 0);

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
          {breakdownData.length ? (
            <ResponsiveContainer width="100%" height={Math.max(200, breakdownData.length * 50)}>
              <BarChart data={breakdownData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "var(--text)", fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text)" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="var(--accent)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No expense breakdown yet.</div>
          )}
        </ChartCard>

        <ChartCard title="Budget usage" subtitle="Pressure">
          {budgetPieData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={budgetPieData} dataKey="spent" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {budgetPieData.map((_entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text)" }} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "var(--text)" }} />
              </PieChart>
            </ResponsiveContainer>
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
