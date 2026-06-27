import { useState, useRef } from "react";
import { apiRequest } from "../api/axios.js";

export default function CsvImport() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("csv", file);

      const result = await apiRequest("/transactions/import", {
        method: "POST",
        body: formData
      });

      setResult(result);
    } catch (err) {
      setError(err.message || "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Import</p>
            <h3>CSV transactions</h3>
          </div>
        </div>
        <p className="page-subtitle">
          Upload a CSV file with columns: <code>date</code>, <code>amount</code>, <code>type</code> (income/expense), <code>category</code>, <code>description</code>.
        </p>

        <form className="stack-form" onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
          <div className="upload-area" onClick={() => fileRef.current?.click()}>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <p><strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</p>
            ) : (
              <p className="upload-placeholder">Click to select a CSV file</p>
            )}
          </div>

          {error ? <div className="form-error" style={{ whiteSpace: "pre-wrap" }}>{error}</div> : null}

          <button type="submit" className="button button-primary" disabled={loading || !file}>
            {loading ? "Importing..." : "Import transactions"}
          </button>
        </form>
      </section>

      {result ? (
        <section className="section-card">
          <div className="section-head">
            <div>
              <p className="card-label">Result</p>
              <h3>Import summary</h3>
            </div>
          </div>
          <div className="report-grid">
            <div className="report-metric">
              <span>Total rows</span>
              <strong>{result.total}</strong>
            </div>
            <div className="report-metric">
              <span>Imported</span>
              <strong style={{ color: "var(--success)" }}>{result.imported}</strong>
            </div>
            <div className="report-metric">
              <span>Errors</span>
              <strong style={{ color: "var(--danger)" }}>{result.errorCount}</strong>
            </div>
          </div>
          {result.errors.length > 0 ? (
            <div className="table-wrap" style={{ marginTop: "16px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((e, i) => (
                    <tr key={i}>
                      <td>{e.row || "-"}</td>
                      <td>{e.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
