import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import ChartCard from "../components/ChartCard.jsx";
import { fetchDashboardSummary } from "../services/dashboardService.js";
import { fetchYearlyReport, fetchYearComparison } from "../services/reportService.js";
import { formatCurrency, formatMonthLabel, toPercent } from "../utils/format.js";
import { exportMonthlyPdf, exportYearlyPdf } from "../services/pdfExport.js";

const PIE_COLORS = ["#6cd4a8", "#f0b35d", "#f16b5e", "#8bcfff", "#a855f7", "#14b8a6", "#f43f5e", "#6366f1", "#22c55e", "#eab308"];
const TABS = ["Monthly", "Yearly", "Comparison"];

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

function MonthlyView({ month, dataVersion }) {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let active = true;
    fetchDashboardSummary(month)
      .then((data) => { if (active) setState({ loading: false, error: "", data }); })
      .catch((err) => { if (active) setState({ loading: false, error: err.message || "Unable to load", data: null }); });
    return () => { active = false; };
  }, [month, dataVersion]);

  if (state.loading) return <div className="loading-panel">Loading reports...</div>;
  if (state.error) return <div className="error-panel">{state.error}</div>;

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
    <>
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Reports</p>
            <h3>Monthly snapshot</h3>
          </div>
          <div className="section-controls">
            <button type="button" className="button button-primary" onClick={() => downloadCsv(`fintrack-${month}.csv`, rows)}>
              Export CSV
            </button>
            <button type="button" className="button button-secondary" onClick={() => exportMonthlyPdf(formatMonthLabel(month), summary, categoryBreakdown, budgets, recentTransactions)}>
              Download PDF
            </button>
          </div>
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
    </>
  );
}

function YearlyView() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    fetchYearlyReport(year)
      .then((data) => { if (active) setState({ loading: false, error: "", data }); })
      .catch((err) => { if (active) setState({ loading: false, error: err.message || "Unable to load", data: null }); });
    return () => { active = false; };
  }, [year]);

  if (state.loading) return <div className="loading-panel">Loading yearly report...</div>;
  if (state.error) return <div className="error-panel">{state.error}</div>;

  const { months, totals, categoryBreakdown } = state.data;

  const monthlyChartData = months.map((m) => ({
    name: formatMonthLabel(m.month),
    Income: m.total_income,
    Expense: m.total_expense
  }));

  const breakdownData = categoryBreakdown.map((item) => ({
    name: item.category_name,
    value: Number(item.total || 0)
  }));

  const csvRows = [
    ["Year", year],
    ["Total Income", formatCurrency(totals.total_income)],
    ["Total Expenses", formatCurrency(totals.total_expense)],
    ["Balance", formatCurrency(totals.balance)]
  ];

  return (
    <>
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Yearly report</p>
            <h3>{year}</h3>
          </div>
          <div className="section-controls">
            <input
              type="number"
              className="input"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ width: "100px" }}
            />
            <button type="button" className="button button-secondary" onClick={() => exportYearlyPdf(year, months, totals, categoryBreakdown)}>
              Download PDF
            </button>
          </div>
        </div>
        <div className="report-grid">
          <div className="report-metric">
            <span>Total income</span>
            <strong>{formatCurrency(totals.total_income)}</strong>
          </div>
          <div className="report-metric">
            <span>Total expenses</span>
            <strong>{formatCurrency(totals.total_expense)}</strong>
          </div>
          <div className="report-metric">
            <span>Balance</span>
            <strong>{formatCurrency(totals.balance)}</strong>
          </div>
          <div className="report-metric">
            <span>Months tracked</span>
            <strong>{months.filter((m) => m.total_income > 0 || m.total_expense > 0).length} / 12</strong>
          </div>
        </div>
      </section>

      <ChartCard title="Monthly income vs expenses" subtitle={year}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthlyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text)" }} />
            <Legend wrapperStyle={{ fontSize: "12px", color: "var(--text)" }} />
            <Bar dataKey="Income" radius={[4, 4, 0, 0]} fill="#6cd4a8" />
            <Bar dataKey="Expense" radius={[4, 4, 0, 0]} fill="#f16b5e" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Yearly category breakdown" subtitle="Full year spending">
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
          <div className="empty-state">No spending data for {year}.</div>
        )}
      </ChartCard>
    </>
  );
}

function ComparisonView() {
  const currentYear = new Date().getFullYear();
  const [yearsInput, setYearsInput] = useState(`${currentYear - 1},${currentYear}`);
  const [state, setState] = useState({ loading: false, error: "", data: null });

  function handleCompare() {
    const years = yearsInput.split(",").map((y) => y.trim()).filter(Boolean);
    if (years.length < 2) return;

    setState((s) => ({ ...s, loading: true, error: "" }));
    fetchYearComparison(years.join(","))
      .then((data) => setState({ loading: false, error: "", data }))
      .catch((err) => setState({ loading: false, error: err.message || "Unable to load", data: null }));
  }

  useEffect(() => { handleCompare(); }, []);

  if (state.loading) return <div className="loading-panel">Loading comparison...</div>;
  if (state.error) return <div className="error-panel">{state.error}</div>;

  const chartData = (state.data || []).map((item) => ({
    name: String(item.year),
    Income: item.total_income,
    Expense: item.total_expense,
    Balance: item.balance
  }));

  return (
    <>
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Year-over-year</p>
            <h3>Comparison</h3>
          </div>
          <div className="section-controls">
            <input
              type="text"
              className="input"
              value={yearsInput}
              onChange={(e) => setYearsInput(e.target.value)}
              placeholder="e.g. 2024,2025,2026"
              style={{ width: "180px" }}
            />
            <button type="button" className="button button-primary" onClick={handleCompare}>
              Compare
            </button>
          </div>
        </div>
      </section>

      {chartData.length > 0 ? (
        <>
          <ChartCard title="Year comparison" subtitle="Income, expenses & balance by year">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text)" }} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "var(--text)" }} />
                <Bar dataKey="Income" radius={[4, 4, 0, 0]} fill="#6cd4a8" />
                <Bar dataKey="Expense" radius={[4, 4, 0, 0]} fill="#f16b5e" />
                <Bar dataKey="Balance" radius={[4, 4, 0, 0]} fill="#8bcfff" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <section className="section-card">
            <div className="section-head">
              <div>
                <p className="card-label">Details</p>
                <h3>Year-over-year breakdown</h3>
              </div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Income</th>
                    <th>Expenses</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data.map((item) => (
                    <tr key={item.year}>
                      <td>{item.year}</td>
                      <td>{formatCurrency(item.total_income)}</td>
                      <td>{formatCurrency(item.total_expense)}</td>
                      <td>{formatCurrency(item.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <div className="empty-state">Enter at least 2 comma-separated years and click Compare.</div>
      )}
    </>
  );
}

export default function Reports({ month, dataVersion }) {
  const [tab, setTab] = useState("Monthly");

  return (
    <div className="page-stack">
      <div className="tab-bar">
        {TABS.map((t) => (
          <button key={t} type="button" className={`tab-button ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Monthly" && <MonthlyView month={month} dataVersion={dataVersion} />}
      {tab === "Yearly" && <YearlyView />}
      {tab === "Comparison" && <ComparisonView />}
    </div>
  );
}
