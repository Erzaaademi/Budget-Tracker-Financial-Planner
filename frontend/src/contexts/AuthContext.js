"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api.setAuthToken(token)
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get("/users/profile")
      setUser(response.data)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      localStorage.removeItem("token")
      api.setAuthToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post("/users/login", { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.setAuthToken(token)
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post("/users/register", userData)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.setAuthToken(token)
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    api.setAuthToken(null)
    setUser(null)
  }

  const updateProfile = async (updates) => {
    try {
      const response = await api.put("/users/profile", updates)
      setUser(response.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Profile update failed",
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
