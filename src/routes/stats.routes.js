const express = require("express")
const router = express.Router()
const StatsController = require("../controllers/stats.controller")
const authMiddleware = require("../middlewares/auth.middleware")

// Thống kê doanh thu (chỉ admin)
router.get("/revenue", authMiddleware.authenticate, authMiddleware.authorize("admin"), StatsController.getRevenueStats)

// Thống kê doanh thu theo thời gian (chỉ admin)
router.get(
  "/revenue/timeline",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  StatsController.getRevenueTimeline,
)

// Thống kê sách bán chạy (chỉ admin)
router.get(
  "/top-selling-books",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  StatsController.getTopSellingBooks,
)

// Thống kê người dùng (chỉ admin)
router.get("/users", authMiddleware.authenticate, authMiddleware.authorize("admin"), StatsController.getUserStats)

module.exports = router
