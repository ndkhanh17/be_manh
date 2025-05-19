const express = require("express")
const router = express.Router()

const authRoutes = require("./auth.routes")
const bookRoutes = require("./book.routes")
const orderRoutes = require("./order.routes")
const categoryRoutes = require("./category.routes")
const userRoutes = require("./user.routes")
const statsRoutes = require("./stats.routes")
const uploadRoutes = require("./upload.routes") // Thêm route upload
const paymentRoutes = require("./payment.routes")

router.use("/auth", authRoutes)
router.use("/books", bookRoutes)
router.use("/orders", orderRoutes)
router.use("/categories", categoryRoutes)
router.use("/users", userRoutes)
router.use("/stats", statsRoutes)
router.use("/upload", uploadRoutes) // Thêm route upload
router.use("/payment", paymentRoutes)

module.exports = router
