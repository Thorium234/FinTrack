import { useEffect, useState } from "react";
import TransactionTable from "../components/TransactionTable.jsx";
import { fetchCategories } from "../services/categoryService.js";
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction
} from "../services/transactionService.js";

const EMPTY_FORM = {
  amount: "",
  type: "expense",
  transactionDate: new Date().toISOString().slice(0, 10),
  categoryId: "",
  description: "",
  receiptFile: null
};

export default function Transactions({ month, dataVersion, onRefresh }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([fetchTransactions({ month }), fetchCategories()])
      .then(([transactionList, categoryList]) => {
        if (!active) {
          return;
        }
        setTransactions(transactionList);
        setCategories(categoryList);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err.message || "Unable to load transactions");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [month, dataVersion]);

  function resetForm() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      transactionDate: new Date().toISOString().slice(0, 10)
    });
  }

  function beginEdit(transaction) {
    setEditingId(transaction.id);
    setForm({
      amount: String(transaction.amount ?? ""),
      type: transaction.type || "expense",
      transactionDate:
        transaction.transaction_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      categoryId: transaction.category_id || "",
      description: transaction.description || "",
      receiptFile: null
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        amount: form.amount,
        type: form.type,
        transactionDate: form.transactionDate,
        categoryId: form.categoryId || undefined,
        description: form.description,
        receiptFile: form.receiptFile || undefined
      };

      if (editingId) {
        await updateTransaction(editingId, payload);
      } else {
        await createTransaction(payload);
      }

      const updatedTransactions = await fetchTransactions({ month });
      setTransactions(updatedTransactions);
      resetForm();
      onRefresh();
    } catch (err) {
      setError(err.message || "Unable to save transaction");
    }
  }

  async function handleDelete(transaction) {
    if (!window.confirm(`Delete transaction ${transaction.id}?`)) {
      return;
    }

    try {
      await deleteTransaction(transaction.id);
      setTransactions((current) => current.filter((item) => item.id !== transaction.id));
      onRefresh();
    } catch (err) {
      setError(err.message || "Unable to delete transaction");
    }
  }

  if (loading) {
    return <div className="loading-panel">Loading transactions...</div>;
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Transaction editor</p>
            <h3>{editingId ? "Edit transaction" : "Add transaction"}</h3>
          </div>
          {editingId ? (
            <button type="button" className="button button-secondary" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </div>

        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            <span>Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              required
            />
          </label>
          <label>
            <span>Type</span>
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label>
            <span>Date</span>
            <input
              type="date"
              value={form.transactionDate}
              onChange={(event) => setForm({ ...form, transactionDate: event.target.value })}
              required
            />
          </label>
          <label>
            <span>Category</span>
            <select
              value={form.categoryId}
              onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid-span-2">
            <span>Description</span>
            <input
              type="text"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Optional note"
            />
          </label>
          <label className="grid-span-2">
            <span>Receipt</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(event) => setForm({ ...form, receiptFile: event.target.files?.[0] || null })}
            />
          </label>
          {error ? <p className="form-error grid-span-2">{error}</p> : null}
          <div className="grid-span-2 form-actions">
            <button type="submit" className="button button-primary">
              {editingId ? "Update transaction" : "Save transaction"}
            </button>
            <button type="button" className="button button-secondary" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="card-label">Ledger</p>
            <h3>Transactions</h3>
          </div>
          <p className="section-note">{transactions.length} records</p>
        </div>
        <TransactionTable transactions={transactions} onEdit={beginEdit} onDelete={handleDelete} />
      </section>
    </div>
  );
}
