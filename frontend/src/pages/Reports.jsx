import { useEffect, useState } from "react";
import ChartCard from "../components/ChartCard.jsx";
import { fetchDashboardSummary } from "../services/dashboardService.js";
import { formatCurrency, formatMonthLabel, toPercent } from "../utils/format.js";

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
        <ChartCard title="Category pressure" subtitle="Spending">
          {categoryBreakdown.length ? (
            <div className="report-bars">
              {categoryBreakdown.map((item) => (
                <div key={`${item.category_id || item.category_name}`} className="bar-row">
                  <div className="bar-row-head">
                    <span>{item.category_name}</span>
                    <strong>{formatCurrency(item.total)}</strong>
                  </div>
                  <div className="bar-track">
                    <span
                      style={{
                        width: `${Math.max(
                          8,
                          Math.min(
                            100,
                            (Number(item.total || 0) /
                              Math.max(
                                ...categoryBreakdown.map((entry) => Number(entry.total || 0)),
                                1
                              )) *
                              100
                          )
                        )}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No category breakdown available.</div>
          )}
        </ChartCard>

        <ChartCard title="Recent activity" subtitle="Transactions">
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
        </ChartCard>
      </div>
    </div>
  );
}
