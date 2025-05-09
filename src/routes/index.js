const express = require("express")
const router = express.Router()

const authRoutes = require("./auth.routes")
const bookRoutes = require("./book.routes")
const orderRoutes = require("./order.routes")
const categoryRoutes = require("./category.routes")
const userRoutes = require("./user.routes")

router.use("/auth", authRoutes)
router.use("/books", bookRoutes)
router.use("/orders", orderRoutes)
router.use("/categories", categoryRoutes)
router.use("/users", userRoutes)

module.exports = router
