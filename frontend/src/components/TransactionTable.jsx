import { formatCurrency, formatDate } from "../utils/format.js";

export default function TransactionTable({ transactions, onEdit, onDelete }) {
  if (!transactions.length) {
    return <div className="empty-state">No transactions yet.</div>;
  }

  return (
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Type</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{formatDate(transaction.transaction_date)}</td>
              <td>{transaction.category_name || "Uncategorized"}</td>
              <td>{transaction.description || "—"}</td>
              <td>
                <span className={`pill pill-${transaction.type}`}>{transaction.type}</span>
              </td>
              <td>{formatCurrency(transaction.amount)}</td>
              <td className="row-actions">
                <button type="button" className="text-button" onClick={() => onEdit(transaction)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="text-button text-danger"
                  onClick={() => onDelete(transaction)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
