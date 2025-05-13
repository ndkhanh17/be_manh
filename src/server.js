const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const path = require("path")
const fs = require("fs")
const { connectToDatabase } = require("./config/database")
const routes = require("./routes")
const errorHandler = require("./middlewares/errorHandler")

// Load environment variables
require("dotenv").config()

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5001

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("Created uploads directory at:", uploadsDir)
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir))

// Connect to MongoDB
connectToDatabase()

// Routes
app.use("/api", routes)

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app
