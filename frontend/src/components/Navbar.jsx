import { formatMonthLabel } from "../utils/format.js";

export default function Navbar({ user, month, onMonthChange, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">FinTrack</p>
        <h1 className="page-title">Personal finance control room</h1>
        <p className="page-subtitle">
          {user?.name ? `Signed in as ${user.name}` : "Signed in"} · {formatMonthLabel(month)}
        </p>
      </div>

      <div className="topbar-actions">
        <label className="month-picker">
          <span>Month</span>
          <input
            type="month"
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
          />
        </label>
        <button type="button" className="button button-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
