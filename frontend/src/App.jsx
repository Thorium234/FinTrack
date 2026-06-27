import { useEffect, useState } from "react";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import useAuth from "./hooks/useAuth.js";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";
import Reports from "./pages/Reports.jsx";
import "./App.css";

function getRouteFromHash() {
  const value = window.location.hash.replace(/^#/, "");
  if (!value || value === "/") {
    return "/dashboard";
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function AppContent() {
  const auth = useAuth();
  const [route, setRoute] = useState(getRouteFromHash());
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const syncRoute = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", syncRoute);

    if (!window.location.hash) {
      window.location.hash = auth.isAuthenticated ? "#/dashboard" : "#/login";
    }

    return () => window.removeEventListener("hashchange", syncRoute);
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (!auth.ready) {
      return;
    }

    if (!auth.isAuthenticated && route !== "/login" && route !== "/register") {
      window.location.hash = "#/login";
      return;
    }

    if (auth.isAuthenticated && (route === "/login" || route === "/register")) {
      window.location.hash = "#/dashboard";
    }
  }, [auth.isAuthenticated, auth.ready, route]);

  function navigate(nextRoute) {
    window.location.hash = `#${nextRoute}`;
  }

  function refreshData() {
    setDataVersion((current) => current + 1);
  }

  if (!auth.ready) {
    return <div className="loading-screen">Initializing FinTrack...</div>;
  }

  if (!auth.isAuthenticated) {
    return route === "/register" ? <Register /> : <Login />;
  }

  const pageMap = {
    "/dashboard": (
      <Dashboard
        key={`dashboard-${month}`}
        month={month}
        dataVersion={dataVersion}
        onNavigate={navigate}
      />
    ),
    "/transactions": (
      <Transactions
        key={`transactions-${month}`}
        month={month}
        dataVersion={dataVersion}
        onRefresh={refreshData}
      />
    ),
    "/budgets": (
      <Budgets
        key={`budgets-${month}`}
        month={month}
        dataVersion={dataVersion}
        onRefresh={refreshData}
      />
    ),
    "/reports": <Reports key={`reports-${month}`} month={month} dataVersion={dataVersion} />
  };

  const page = pageMap[route] || pageMap["/dashboard"];

  return (
    <DashboardLayout
      activeRoute={route in pageMap ? route : "/dashboard"}
      month={month}
      onMonthChange={(nextMonth) => {
        setMonth(nextMonth || month);
        refreshData();
      }}
      onNavigate={navigate}
      onLogout={auth.logout}
      user={auth.user}
    >
      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>{page}</ProtectedRoute>
    </DashboardLayout>
  );
}

export default function App() {
  return <AppContent />;
}
