import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const NAV_ITEMS = [
  { label: "Dashboard", route: "/dashboard" },
  { label: "Transactions", route: "/transactions" },
  { label: "Budgets", route: "/budgets" },
  { label: "Reports", route: "/reports" },
  { label: "Import", route: "/import" }
];

export default function DashboardLayout({
  activeRoute,
  children,
  month,
  onMonthChange,
  onNavigate,
  onLogout,
  user
}) {
  return (
    <div className="app-shell">
      <Sidebar activeRoute={activeRoute} items={NAV_ITEMS} onNavigate={onNavigate} />
      <div className="app-main">
        <Navbar
          user={user}
          month={month}
          onMonthChange={onMonthChange}
          onLogout={onLogout}
        />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
