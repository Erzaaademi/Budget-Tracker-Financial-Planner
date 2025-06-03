"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import api from "../services/api"
import toast from "react-hot-toast"

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [budgetAnalytics, setBudgetAnalytics] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [statsRes, budgetRes, transactionsRes] = await Promise.all([
        api.getTransactionStats(),
        api.getBudgetAnalytics(),
        api.getTransactions({ limit: 5 }),
      ])

      setStats(statsRes.data)
      setBudgetAnalytics(budgetRes.data)
      setRecentTransactions(transactionsRes.data.transactions)
    } catch (error) {
      console.error("Dashboard data fetch error:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  const totalIncome = stats?.summary?.find((s) => s._id === "income")?.total || 0
  const totalExpenses = stats?.summary?.find((s) => s._id === "expense")?.total || 0
  const netIncome = totalIncome - totalExpenses

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <h1 style={{ marginBottom: "30px", color: "#333" }}>Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-3" style={{ marginBottom: "30px" }}>
        <div className="card">
          <h3 style={{ color: "#28a745", marginBottom: "10px" }}>Total Income</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>${totalIncome.toFixed(2)}</p>
        </div>

        <div className="card">
          <h3 style={{ color: "#dc3545", marginBottom: "10px" }}>Total Expenses</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>${totalExpenses.toFixed(2)}</p>
        </div>

        <div className="card">
          <h3 style={{ color: netIncome >= 0 ? "#28a745" : "#dc3545", marginBottom: "10px" }}>Net Income</h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: 0,
              color: netIncome >= 0 ? "#28a745" : "#dc3545",
            }}
          >
            ${netIncome.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Expense Categories Chart */}
        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>Expense Categories</h3>
          {stats?.categoryBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                  nameKey="_id"
                >
                  {stats.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>No expense data available</p>
          )}
        </div>

        {/* Budget Overview */}
        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>Budget Overview</h3>
          {budgetAnalytics ? (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <div className="d-flex justify-between align-center" style={{ marginBottom: "10px" }}>
                  <span>Total Budget:</span>
                  <strong>${budgetAnalytics.totalLimit.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-between align-center" style={{ marginBottom: "10px" }}>
                  <span>Total Spent:</span>
                  <strong>${budgetAnalytics.totalSpent.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-between align-center" style={{ marginBottom: "15px" }}>
                  <span>Remaining:</span>
                  <strong style={{ color: "#28a745" }}>
                    ${(budgetAnalytics.totalLimit - budgetAnalytics.totalSpent).toFixed(2)}
                  </strong>
                </div>

                <div className="progress">
                  <div
                    className={`progress-bar ${
                      budgetAnalytics.totalSpent > budgetAnalytics.totalLimit
                        ? "danger"
                        : budgetAnalytics.totalSpent / budgetAnalytics.totalLimit > 0.8
                          ? "warning"
                          : "success"
                    }`}
                    style={{
                      width: `${Math.min((budgetAnalytics.totalSpent / budgetAnalytics.totalLimit) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: "15px", fontSize: "16px" }}>Alerts</h4>
                {budgetAnalytics.budgetsOverLimit > 0 && (
                  <div className="alert alert-error">{budgetAnalytics.budgetsOverLimit} budget(s) over limit</div>
                )}
                {budgetAnalytics.budgetsNearLimit > 0 && (
                  <div className="alert alert-warning">{budgetAnalytics.budgetsNearLimit} budget(s) near limit</div>
                )}
                {budgetAnalytics.budgetsOverLimit === 0 && budgetAnalytics.budgetsNearLimit === 0 && (
                  <div className="alert alert-success">All budgets are on track!</div>
                )}
              </div>
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>No budget data available</p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card" style={{ marginTop: "30px" }}>
        <h3 style={{ marginBottom: "20px" }}>Recent Transactions</h3>
        {recentTransactions.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.category}</td>
                    <td>
                      <span className={`badge ${transaction.type === "income" ? "badge-success" : "badge-danger"}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td
                      style={{
                        color: transaction.type === "income" ? "#28a745" : "#dc3545",
                        fontWeight: "bold",
                      }}
                    >
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>No transactions found</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
