export default function Sidebar({ activeRoute, items, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">F</div>
        <div>
          <p className="brand-name">FinTrack</p>
          <p className="brand-tagline">Track. budget. adjust.</p>
        </div>
      </div>

      <nav className="side-nav">
        {items.map((item) => (
          <button
            key={item.route}
            type="button"
            className={`side-nav-item ${activeRoute === item.route ? "is-active" : ""}`}
            onClick={() => onNavigate(item.route)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
