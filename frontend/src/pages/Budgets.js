"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import api from "../services/api"
import toast from "react-hot-toast"

const Budgets = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await api.getBudgets()
      setBudgets(response.data.budgets)
    } catch (error) {
      console.error("Fetch budgets error:", error)
      toast.error("Failed to load budgets")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingBudget) {
        await api.updateBudget(editingBudget._id, data)
        toast.success("Budget updated successfully")
      } else {
        await api.createBudget(data)
        toast.success("Budget created successfully")
      }

      reset()
      setShowForm(false)
      setEditingBudget(null)
      fetchBudgets()
    } catch (error) {
      console.error("Budget save error:", error)
      toast.error(error.response?.data?.message || "Failed to save budget")
    }
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setValue("name", budget.name)
    setValue("category", budget.category)
    setValue("limit", budget.limit)
    setValue("period", budget.period)
    setValue("startDate", new Date(budget.startDate).toISOString().split("T")[0])
    setValue("endDate", new Date(budget.endDate).toISOString().split("T")[0])
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await api.deleteBudget(id)
        toast.success("Budget deleted successfully")
        fetchBudgets()
      } catch (error) {
        console.error("Delete budget error:", error)
        toast.error("Failed to delete budget")
      }
    }
  }

  const getProgressBarClass = (percentage) => {
    if (percentage > 100) return "danger"
    if (percentage > 80) return "warning"
    return "success"
  }

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <div className="d-flex justify-between align-center" style={{ marginBottom: "30px" }}>
        <h1 style={{ color: "#333" }}>Budgets</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true)
            setEditingBudget(null)
            reset()
          }}
        >
          Create Budget
        </button>
      </div>

      {/* Budget Form Modal */}
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
              <h3>{editingBudget ? "Edit Budget" : "Create Budget"}</h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingBudget(null)
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
                <label className="form-label">Budget Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Monthly Food Budget"
                  {...register("name", { required: "Budget name is required" })}
                />
                {errors.name && <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Food, Transportation, Entertainment"
                  {...register("category", { required: "Category is required" })}
                />
                {errors.category && (
                  <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.category.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Budget Limit</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="0.00"
                  {...register("limit", {
                    required: "Budget limit is required",
                    min: { value: 0.01, message: "Budget limit must be greater than 0" },
                  })}
                />
                {errors.limit && <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.limit.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Period</label>
                <select className="form-control" {...register("period", { required: "Period is required" })}>
                  <option value="">Select Period</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {errors.period && <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.period.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  {...register("startDate", { required: "Start date is required" })}
                />
                {errors.startDate && (
                  <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.startDate.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  {...register("endDate", { required: "End date is required" })}
                />
                {errors.endDate && <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.endDate.message}</span>}
              </div>

              <div className="d-flex justify-between" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingBudget(null)
                    reset()
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBudget ? "Update" : "Create"} Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budgets List */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-2">
          {budgets.map((budget) => (
            <div key={budget._id} className="card">
              <div className="d-flex justify-between align-center" style={{ marginBottom: "15px" }}>
                <h3 style={{ margin: 0, fontSize: "18px" }}>{budget.name}</h3>
                <span className={`badge ${budget.isActive ? "badge-success" : "badge-warning"}`}>
                  {budget.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <div className="d-flex justify-between" style={{ marginBottom: "5px" }}>
                  <span>Category:</span>
                  <strong>{budget.category}</strong>
                </div>
                <div className="d-flex justify-between" style={{ marginBottom: "5px" }}>
                  <span>Period:</span>
                  <strong>{budget.period}</strong>
                </div>
                <div className="d-flex justify-between" style={{ marginBottom: "5px" }}>
                  <span>Spent:</span>
                  <strong>${budget.spent.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-between" style={{ marginBottom: "5px" }}>
                  <span>Limit:</span>
                  <strong>${budget.limit.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-between" style={{ marginBottom: "10px" }}>
                  <span>Remaining:</span>
                  <strong style={{ color: budget.remaining > 0 ? "#28a745" : "#dc3545" }}>
                    ${budget.remaining.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <div className="d-flex justify-between" style={{ marginBottom: "5px" }}>
                  <span>Progress:</span>
                  <strong>{budget.percentageSpent.toFixed(1)}%</strong>
                </div>
                <div className="progress">
                  <div
                    className={`progress-bar ${getProgressBarClass(budget.percentageSpent)}`}
                    style={{
                      width: `${Math.min(budget.percentageSpent, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
                <div>Start: {new Date(budget.startDate).toLocaleDateString()}</div>
                <div>End: {new Date(budget.endDate).toLocaleDateString()}</div>
              </div>

              <div className="d-flex justify-between">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(budget)}
                  style={{ fontSize: "14px", padding: "6px 12px" }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(budget._id)}
                  style={{ fontSize: "14px", padding: "6px 12px" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>
            No budgets found. Create your first budget to get started!
          </p>
        </div>
      )}
    </div>
  )
}

export default Budgets
