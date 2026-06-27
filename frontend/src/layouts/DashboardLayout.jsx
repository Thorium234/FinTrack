import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function DashboardLayout({
  activeRoute,
  children,
  month,
  onMonthChange,
  onNavigate,
  onLogout,
  user
}) {
  const navItems = [
    { label: "Dashboard", route: "/dashboard" },
    { label: "Transactions", route: "/transactions" },
    { label: "Recurring", route: "/recurring" },
    { label: "Budgets", route: "/budgets" },
    { label: "Goals", route: "/goals" },
    { label: "Reports", route: "/reports" },
    { label: "Import", route: "/import" }
  ];

  if (user?.isAdmin) {
    navItems.push({ label: "Admin", route: "/admin" });
  }

  return (
    <div className="app-shell">
      <Sidebar activeRoute={activeRoute} items={navItems} onNavigate={onNavigate} />
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
