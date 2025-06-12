const axios = require("axios")

async function testProfileUpdate() {
  console.log("🧪 TESTING PROFILE UPDATE")
  console.log("========================")

  try {
    // Login first
    console.log("1. Logging in...")
    const loginResponse = await axios.post("http://localhost:3001/api/users/login", {
      email: "erza@gmail.com",
      password: "password123",
    })

    const token = loginResponse.data.token
    console.log("✅ Login successful")

    // Test profile update
    console.log("2. Testing profile update...")
    const updateResponse = await axios.put(
      "http://localhost:3001/api/users/profile",
      {
        firstName: "Erza Updated",
        lastName: "Test User",
        "preferences.currency": "EUR",
        "preferences.theme": "dark",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log("✅ Profile update successful!")
    console.log("Updated user:", {
      firstName: updateResponse.data.firstName,
      lastName: updateResponse.data.lastName,
      preferences: updateResponse.data.preferences,
    })

    // Test another update
    console.log("3. Testing currency change only...")
    const currencyResponse = await axios.put(
      "http://localhost:3001/api/users/profile",
      {
        "preferences.currency": "GBP",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log("✅ Currency update successful!")
    console.log("Updated preferences:", currencyResponse.data.preferences)
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message)
    if (error.response?.data) {
      console.error("Error details:", error.response.data)
    }
  }
}

testProfileUpdate()
