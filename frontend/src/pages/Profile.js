"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      "preferences.currency": user?.preferences?.currency || "USD",
      "preferences.theme": user?.preferences?.theme || "light",
    },
  })

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const result = await updateProfile(data)

      if (result.success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <h1 style={{ marginBottom: "30px", color: "#333" }}>Profile Settings</h1>

      <div className="grid grid-2">
        {/* Profile Information */}
        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>Personal Information</h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                {...register("firstName", { required: "First name is required" })}
              />
              {errors.firstName && (
                <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.firstName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && <span style={{ color: "#dc3545", fontSize: "14px" }}>{errors.lastName.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                disabled
                style={{ backgroundColor: "#f8f9fa", color: "#6c757d" }}
              />
              <small style={{ color: "#6c757d" }}>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={user.username}
                disabled
                style={{ backgroundColor: "#f8f9fa", color: "#6c757d" }}
              />
              <small style={{ color: "#6c757d" }}>Username cannot be changed</small>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>Preferences</h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-control" {...register("preferences.currency")}>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Theme</label>
              <select className="form-control" {...register("preferences.theme")}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Updating..." : "Update Preferences"}
            </button>
          </form>
        </div>
      </div>

      {/* Account Information */}
      <div className="card" style={{ marginTop: "30px" }}>
        <h3 style={{ marginBottom: "20px" }}>Account Information</h3>

        <div className="grid grid-2">
          <div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Account Created:</strong>
              <div style={{ color: "#666" }}>{new Date(user.createdAt).toLocaleDateString()}</div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>Last Updated:</strong>
              <div style={{ color: "#666" }}>{new Date(user.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Role:</strong>
              <div>
                <span className={`badge ${user.role === "admin" ? "badge-warning" : "badge-success"}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>User ID:</strong>
              <div style={{ color: "#666", fontSize: "14px", fontFamily: "monospace" }}>{user.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
