import { useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", route: "/dashboard" },
    { label: "Transactions", route: "/transactions" },
    { label: "Recurring", route: "/recurring" },
    { label: "Budgets", route: "/budgets" },
    { label: "Goals", route: "/goals" },
    { label: "Reports", route: "/reports" },
    { label: "Import", route: "/import" }
  ];

  if (user?.is_admin) {
    navItems.push({ label: "Admin", route: "/admin" });
  }

  function handleNavigate(route) {
    setSidebarOpen(false);
    onNavigate(route);
  }

  return (
    <div className="app-shell">
      <div className={`sidebar-overlay ${sidebarOpen ? "is-visible" : ""}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar
        activeRoute={activeRoute}
        items={navItems}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-main">
        <Navbar
          user={user}
          month={month}
          onMonthChange={onMonthChange}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
