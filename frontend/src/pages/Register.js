"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await register(formData)

    if (result.success) {
      toast.success("Registration successful!")
    } else {
      toast.error(result.error)
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>Create Your Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              className="form-control"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="form-control"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "20px" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#007bff", textDecoration: "none" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
