const express = require("express")
const router = express.Router()
const OrderController = require("../controllers/order.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validator.middleware")
const orderValidation = require("../validations/order.validation")

// Create a new order (public or authenticated)
router.post("/", validate(orderValidation.createOrder), OrderController.createOrder)

// Get order by ID (authenticated)
router.get("/:id", authMiddleware.authenticate, OrderController.getOrderById)

// Get current user's orders (authenticated)
router.get("/user/me", authMiddleware.authenticate, OrderController.getUserOrders)

// Get all orders (admin only)
router.get("/", authMiddleware.authenticate, authMiddleware.authorize("admin"), OrderController.getAllOrders)

// Update order status (admin only)
router.patch(
  "/:id/status",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  validate(orderValidation.updateOrderStatus),
  OrderController.updateOrderStatus,
)

// Get order statistics (admin only)
router.get(
  "/stats/overview",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  OrderController.getOrderStats,
)

// Get recent orders (admin only)
router.get(
  "/recent/list",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  OrderController.getRecentOrders,
)

// Thêm route lấy lịch sử đơn hàng chi tiết
router.get("/history", authMiddleware.authenticate, OrderController.getOrderHistory)

module.exports = router
