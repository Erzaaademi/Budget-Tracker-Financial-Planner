const http = require("http")

const services = [
  { name: "User Service", port: 3001, path: "/health" },
  { name: "Transaction Service", port: 3002, path: "/health" },
  { name: "Budget Service", port: 3003, path: "/health" },
  { name: "Frontend", port: 3000, path: "/" },
]

async function checkService(service) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: service.port,
      path: service.path,
      method: "GET",
      timeout: 5000,
    }

    const req = http.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        resolve({
          name: service.name,
          status: res.statusCode === 200 ? "✅ Running" : `❌ Error (${res.statusCode})`,
          port: service.port,
          response: data.substring(0, 100),
        })
      })
    })

    req.on("error", (error) => {
      resolve({
        name: service.name,
        status: `❌ Connection Error: ${error.message}`,
        port: service.port,
        response: "",
      })
    })

    req.on("timeout", () => {
      resolve({
        name: service.name,
        status: "❌ Timeout",
        port: service.port,
        response: "",
      })
    })

    req.end()
  })
}

async function diagnose() {
  console.log("🔍 Budget Tracker Diagnostic")
  console.log("============================\n")

  // Check MongoDB
  console.log("📊 Checking MongoDB...")
  try {
    const { MongoClient } = require("mongodb")
    const client = new MongoClient("mongodb://localhost:27017/Budget-Tracker-&-Financial-Planner")
    await client.connect()
    await client.db().admin().ping()
    console.log("✅ MongoDB: Connected\n")
    await client.close()
  } catch (error) {
    console.log(`❌ MongoDB: ${error.message}\n`)
  }

  // Check services
  console.log("🔍 Checking Services...")
  const results = await Promise.all(services.map(checkService))

  results.forEach((result) => {
    console.log(`${result.status} ${result.name} (Port: ${result.port})`)
    if (result.response) {
      console.log(`   Response: ${result.response}`)
    }
  })

  console.log("\n📱 Expected URLs:")
  console.log("Frontend:           http://localhost:3000")
  console.log("User Service API:   http://localhost:3001/api")
  console.log("Transaction API:    http://localhost:3002/api")
  console.log("Budget API:         http://localhost:3003/api")
}

diagnose().catch(console.error)
