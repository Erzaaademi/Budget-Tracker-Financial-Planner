"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import api from "../services/api"
import toast from "react-hot-toast"

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const watchType = watch("type")

  useEffect(() => {
    fetchTransactions()
    fetchBudgets()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ""))
      const response = await api.getTransactions(params)
      setTransactions(response.data.transactions)
    } catch (error) {
      console.error("Fetch transactions error:", error)
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgets = async () => {
    try {
      const response = await api.getBudgets({ isActive: true })
      setBudgets(response.data.budgets)
    } catch (error) {
      console.error("Fetch budgets error:", error)
    }
  }

  const onSubmit = async (data) => {
    try {
      // Only include budgetId if type is expense and a budget is selected
      const transactionData = {
        ...data,
        budgetId: data.type === "expense" && data.budgetId ? data.budgetId : undefined,
      }

      if (editingTransaction) {
        await api.updateTransaction(editingTransaction._id, transactionData)
        toast.success("Transaction updated successfully")
      } else {
        await api.createTransaction(transactionData)
        toast.success("Transaction created successfully")
      }

      reset()
      setShowForm(false)
      setEditingTransaction(null)
      fetchTransactions()
    } catch (error) {
      console.error("Transaction save error:", error)
      toast.error("Failed to save transaction")
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setValue("amount", transaction.amount)
    setValue("type", transaction.type)
    setValue("category", transaction.category)
    setValue("description", transaction.description)
    setValue("date", new Date(transaction.date).toISOString().split("T")[0])
    setValue("budgetId", transaction.budgetId || "")
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await api.deleteTransaction(id)
        toast.success("Transaction deleted successfully")
        fetchTransactions()
      } catch (error) {
        console.error("Delete transaction error:", error)
        toast.error("Failed to delete transaction")
      }
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const clearFilters = () => {
    setFilters({
      type: "",
      category: "",
      startDate: "",
      endDate: "",
    })
  }

  // Get available budgets for the selected category
  const getAvailableBudgets = () => {
    const selectedCategory = watch("category")
    if (!selectedCategory) return budgets

    return budgets.filter((budget) => budget.category.toLowerCase().includes(selectedCategory.toLowerCase()))
  }

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <div className="d-flex justify-between align-center" style={{ marginBottom: "30px" }}>
        <h1 style={{ color: "#333" }}>Transactions</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true)
            setEditingTransaction(null)
            reset()
          }}
        >
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "20px" }}>Filters</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select name="type" className="form-control" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              type="text"
              name="category"
              className="form-control"
              placeholder="Filter by category"
              value={filters.category}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="form-control"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              className="form-control"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: "10px" }}>
          Clear Filters
        </button>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: "100%", maxWidth: "500px", margin: "20px" }}>
            <div className="d-flex justify-between align-center" style={{ marginBottom: "20px" }}>
              <h3>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingTransaction(null)
                  reset()
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 0.01, message: "Amount must be greater than 0" },
                  })}
                />
                {errors.amount && <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.amount.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" {...register("type", { required: "Type is required" })}>
                  <option value="">Select Type</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                {errors.type && <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.type.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Food, Transportation, Salary"
                  {...register("category", { required: "Category is required" })}
                />
                {errors.category && (
                  <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.category.message}</span>
                )}
              </div>

              {/* Budget Selection - Only show for expenses */}
              {watchType === "expense" && (
                <div className="form-group">
                  <label className="form-label">Budget (Optional)</label>
                  <select className="form-control" {...register("budgetId")}>
                    <option value="">No Budget</option>
                    {getAvailableBudgets().map((budget) => (
                      <option key={budget._id} value={budget._id}>
                        {budget.name} - {budget.category} (${budget.spent.toFixed(2)}/${budget.limit.toFixed(2)})
                      </option>
                    ))}
                  </select>
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    Select a budget to automatically track spending
                  </small>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Transaction description"
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && (
                  <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.description.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" {...register("date", { required: "Date is required" })} />
                {errors.date && <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.date.message}</span>}
              </div>

              <div className="d-flex justify-between" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingTransaction(null)
                    reset()
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTransaction ? "Update" : "Create"} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>Transaction History</h3>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Budget</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const linkedBudget = budgets.find((b) => b._id === transaction.budgetId)

                  return (
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
                      <td>
                        {linkedBudget ? (
                          <span style={{ fontSize: "12px", color: "#666" }}>{linkedBudget.name}</span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#999" }}>No Budget</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEdit(transaction)}
                          style={{ marginRight: "10px", fontSize: "12px", padding: "4px 8px" }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(transaction._id)}
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
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

export default Transactions
