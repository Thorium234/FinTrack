import { useEffect, useState } from "react";
import { fetchAdminUsers, fetchUserData } from "../services/adminService.js";
import { formatCurrency } from "../utils/format.js";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminUsers()
      .then((list) => { setUsers(list); setLoading(false); })
      .catch((err) => { setError(err.message || "Unable to load users"); setLoading(false); });
  }, []);

  async function selectUser(userId) {
    setSelectedUser(userId);
    setLoadingDetail(true);
    setUserData(null);
    try {
      const data = await fetchUserData(userId);
      setUserData(data);
    } catch (err) {
      setError(err.message || "Unable to load user data");
    } finally {
      setLoadingDetail(false);
    }
  }

  if (loading) return <div className="loading-panel">Loading admin panel...</div>;
  if (error && !users.length) return <div className="error-panel">{error}</div>;

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Admin</p>
            <h3>User management</h3>
          </div>
          <p className="section-note">{users.length} users</p>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`pill ${u.is_admin ? "pill-active" : "pill-inactive"}`}>{u.is_admin ? "Yes" : "No"}</span></td>
                  <td>{u.created_at ? u.created_at.slice(0, 10) : "-"}</td>
                  <td>
                    <button type="button" className="button button-secondary" onClick={() => selectUser(u.id)}>
                      View data
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedUser ? (
        <section className="section-card">
          <div className="section-head">
            <div>
              <p className="card-label">User details</p>
              <h3>User #{selectedUser}</h3>
            </div>
            <button type="button" className="button button-secondary" onClick={() => { setSelectedUser(null); setUserData(null); }}>
              Close
            </button>
          </div>

          {loadingDetail ? (
            <div className="loading-panel">Loading user data...</div>
          ) : userData ? (
            <div className="page-stack" style={{ gap: "20px" }}>
              <div className="report-grid">
                <div className="report-metric">
                  <span>Name</span>
                  <strong>{userData.user?.name}</strong>
                </div>
                <div className="report-metric">
                  <span>Email</span>
                  <strong>{userData.user?.email}</strong>
                </div>
                <div className="report-metric">
                  <span>Admin</span>
                  <strong>{userData.user?.is_admin ? "Yes" : "No"}</strong>
                </div>
                <div className="report-metric">
                  <span>Joined</span>
                  <strong>{userData.user?.created_at?.slice(0, 10)}</strong>
                </div>
              </div>

              <div>
                <p className="card-label">Transactions</p>
                <h4 style={{ margin: "8px 0 12px" }}>{userData.transactions?.length || 0} transactions</h4>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(userData.transactions || []).slice(0, 20).map((t) => (
                        <tr key={t.id}>
                          <td>{t.id}</td>
                          <td>{t.transaction_date?.slice(0, 10)}</td>
                          <td>{formatCurrency(t.amount)}</td>
                          <td><span className={`pill ${t.type === "income" ? "pill-income" : "pill-expense"}`}>{t.type}</span></td>
                          <td>{t.category_name || "-"}</td>
                          <td>{t.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="dashboard-grid">
                <div>
                  <p className="card-label">Budgets</p>
                  <h4 style={{ margin: "8px 0 12px" }}>{userData.budgets?.length || 0} budgets</h4>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Month</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(userData.budgets || []).map((b) => (
                          <tr key={b.id}>
                            <td>{b.category_name || "-"}</td>
                            <td>{formatCurrency(b.amount)}</td>
                            <td>{b.month}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <p className="card-label">Goals</p>
                  <h4 style={{ margin: "8px 0 12px" }}>{userData.goals?.length || 0} goals</h4>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Target</th>
                          <th>Current</th>
                          <th>Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(userData.goals || []).map((g) => {
                          const pct = g.target_amount ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
                          return (
                            <tr key={g.id}>
                              <td>{g.name}</td>
                              <td>{formatCurrency(g.target_amount)}</td>
                              <td>{formatCurrency(g.current_amount)}</td>
                              <td>{pct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
