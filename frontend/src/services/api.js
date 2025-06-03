import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api"

class ApiService {
  constructor() {
    this.userApi = axios.create({
      baseURL: `${API_BASE_URL}`,
    })

    this.transactionApi = axios.create({
      baseURL: "http://localhost:3002/api",
    })

    this.budgetApi = axios.create({
      baseURL: "http://localhost:3003/api",
    })

    // Add request interceptors for auth tokens
    ;[this.userApi, this.transactionApi, this.budgetApi].forEach((api) => {
      api.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem("token")
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
          return config
        },
        (error) => Promise.reject(error),
      )

      api.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem("token")
            window.location.href = "/login"
          }
          return Promise.reject(error)
        },
      )
    })
  }

  setAuthToken(token) {
    if (token) {
      ;[this.userApi, this.transactionApi, this.budgetApi].forEach((api) => {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      })
    } else {
      ;[this.userApi, this.transactionApi, this.budgetApi].forEach((api) => {
        delete api.defaults.headers.common["Authorization"]
      })
    }
  }

  // User service methods
  async get(endpoint) {
    return this.userApi.get(endpoint)
  }

  async post(endpoint, data) {
    return this.userApi.post(endpoint, data)
  }

  async put(endpoint, data) {
    return this.userApi.put(endpoint, data)
  }

  async delete(endpoint) {
    return this.userApi.delete(endpoint)
  }

  // Transaction service methods
  async getTransactions(params = {}) {
    return this.transactionApi.get("/transactions", { params })
  }

  async createTransaction(data) {
    return this.transactionApi.post("/transactions", data)
  }

  async updateTransaction(id, data) {
    return this.transactionApi.put(`/transactions/${id}`, data)
  }

  async deleteTransaction(id) {
    return this.transactionApi.delete(`/transactions/${id}`)
  }

  async getTransactionStats(params = {}) {
    return this.transactionApi.get("/transactions/stats/summary", { params })
  }

  // Budget service methods
  async getBudgets(params = {}) {
    return this.budgetApi.get("/budgets", { params })
  }

  async createBudget(data) {
    return this.budgetApi.post("/budgets", data)
  }

  async updateBudget(id, data) {
    return this.budgetApi.put(`/budgets/${id}`, data)
  }

  async deleteBudget(id) {
    return this.budgetApi.delete(`/budgets/${id}`)
  }

  async getBudgetAnalytics() {
    return this.budgetApi.get("/budgets/analytics/overview")
  }

  async addGoal(budgetId, data) {
    return this.budgetApi.post(`/budgets/${budgetId}/goals`, data)
  }

  async updateGoal(budgetId, goalId, data) {
    return this.budgetApi.put(`/budgets/${budgetId}/goals/${goalId}`, data)
  }
}

export default new ApiService()
