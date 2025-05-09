const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
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
