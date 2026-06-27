import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import ChartCard from "../components/ChartCard.jsx";
import { fetchDashboardSummary } from "../services/dashboardService.js";
import { formatCurrency, formatMonthLabel, toPercent } from "../utils/format.js";

const PIE_COLORS = ["#6cd4a8", "#f0b35d", "#f16b5e", "#8bcfff", "#a855f7", "#14b8a6", "#f43f5e", "#6366f1", "#22c55e", "#eab308"];

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Reports({ month, dataVersion }) {
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
      .catch((err) => {
        if (!active) {
          return;
        }
        setState({
          loading: false,
          error: err.message || "Unable to load reports",
          data: null
        });
      });

    return () => {
      active = false;
    };
  }, [month, dataVersion]);

  if (state.loading) {
    return <div className="loading-panel">Loading reports...</div>;
  }

  if (state.error) {
    return <div className="error-panel">{state.error}</div>;
  }

  const { summary, recentTransactions, categoryBreakdown, budgets } = state.data;
  const rows = [
    ["Month", formatMonthLabel(month)],
    ["Income", formatCurrency(summary?.total_income)],
    ["Expenses", formatCurrency(summary?.total_expense)],
    ["Balance", formatCurrency(summary?.balance)],
    ["Budget count", budgets.length],
    ["Category count", categoryBreakdown.length]
  ];

  const breakdownData = categoryBreakdown.map((item) => ({
    name: item.category_name,
    value: Number(item.total || 0)
  }));

  const budgetData = budgets
    .map((budget) => ({
      name: budget.category_name,
      spent: Number(budget.spent || 0),
      amount: Number(budget.amount || 0)
    }))
    .filter((b) => b.amount > 0);

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Reports</p>
            <h3>Monthly snapshot</h3>
          </div>
          <button
            type="button"
            className="button button-primary"
            onClick={() => downloadCsv(`fintrack-${month}.csv`, rows)}
          >
            Export snapshot
          </button>
        </div>

        <div className="report-grid">
          <div className="report-metric">
            <span>Income</span>
            <strong>{formatCurrency(summary?.total_income)}</strong>
          </div>
          <div className="report-metric">
            <span>Expenses</span>
            <strong>{formatCurrency(summary?.total_expense)}</strong>
          </div>
          <div className="report-metric">
            <span>Balance</span>
            <strong>{formatCurrency(summary?.balance)}</strong>
          </div>
          <div className="report-metric">
            <span>Budget usage</span>
            <strong>
              {Math.round(
                toPercent(
                  budgets.reduce((sum, budget) => sum + Number(budget.spent || 0), 0),
                  budgets.reduce((sum, budget) => sum + Number(budget.amount || 0), 0)
                )
              )}
              %
            </strong>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <ChartCard title="Category breakdown" subtitle="Spending">
          {breakdownData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {breakdownData.map((_entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text)" }} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "var(--text)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No category breakdown available.</div>
          )}
        </ChartCard>

        <ChartCard title="Budget vs spending" subtitle="Per category">
          {budgetData.length ? (
            <ResponsiveContainer width="100%" height={Math.max(200, budgetData.length * 50)}>
              <BarChart data={budgetData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "var(--text)", fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text)" }} />
                <Bar dataKey="spent" name="Spent" radius={[0, 6, 6, 0]} fill="#f16b5e" />
                <Bar dataKey="amount" name="Budget" radius={[0, 6, 6, 0]} fill="#6cd4a8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No budget data available.</div>
          )}
        </ChartCard>
      </div>

      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Recent activity</p>
            <h3>Transactions</h3>
          </div>
          <p className="section-note">{recentTransactions.length} records</p>
        </div>
        <div className="report-list">
          {recentTransactions.length ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="report-list-item">
                <div>
                  <strong>{transaction.category_name || "Uncategorized"}</strong>
                  <span>{transaction.description || transaction.transaction_date}</span>
                </div>
                <strong>{formatCurrency(transaction.amount)}</strong>
              </div>
            ))
          ) : (
            <div className="empty-state">No recent activity.</div>
          )}
        </div>
      </section>
    </div>
  );
}
