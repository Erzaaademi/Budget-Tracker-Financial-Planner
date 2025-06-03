"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  if (!user) {
    return null
  }

  return (
    <nav
      style={{
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
          <Link
            to="/dashboard"
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#007bff",
              textDecoration: "none",
            }}
          >
            Budget Tracker
          </Link>

          <div style={{ display: "flex", gap: "20px" }}>
            <Link
              to="/dashboard"
              style={{
                textDecoration: "none",
                color: isActive("/dashboard") ? "#007bff" : "#666",
                fontWeight: isActive("/dashboard") ? "600" : "400",
                padding: "8px 12px",
                borderRadius: "4px",
                backgroundColor: isActive("/dashboard") ? "#f0f8ff" : "transparent",
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              style={{
                textDecoration: "none",
                color: isActive("/transactions") ? "#007bff" : "#666",
                fontWeight: isActive("/transactions") ? "600" : "400",
                padding: "8px 12px",
                borderRadius: "4px",
                backgroundColor: isActive("/transactions") ? "#f0f8ff" : "transparent",
              }}
            >
              Transactions
            </Link>
            <Link
              to="/budgets"
              style={{
                textDecoration: "none",
                color: isActive("/budgets") ? "#007bff" : "#666",
                fontWeight: isActive("/budgets") ? "600" : "400",
                padding: "8px 12px",
                borderRadius: "4px",
                backgroundColor: isActive("/budgets") ? "#f0f8ff" : "transparent",
              }}
            >
              Budgets
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ color: "#666" }}>Welcome, {user.firstName}</span>
          <Link
            to="/profile"
            style={{
              textDecoration: "none",
              color: isActive("/profile") ? "#007bff" : "#666",
              fontWeight: isActive("/profile") ? "600" : "400",
            }}
          >
            Profile
          </Link>
          <button onClick={logout} className="btn btn-secondary" style={{ fontSize: "14px", padding: "6px 12px" }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
