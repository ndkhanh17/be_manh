const express = require("express")
const router = express.Router()
const PaymentController = require("../controllers/payment.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validator.middleware")
const paymentValidation = require("../validations/payment.validation")

// Tạo thanh toán mới
router.post(
  "/create",
  authMiddleware.authenticate,
  validate(paymentValidation.createPayment),
  PaymentController.createPayment,
)

// Xử lý thanh toán
router.post(
  "/process",
  authMiddleware.authenticate,
  validate(paymentValidation.processPayment),
  PaymentController.processPayment,
)

// Kiểm tra trạng thái thanh toán
router.get("/status/:paymentId", authMiddleware.authenticate, PaymentController.getPaymentStatus)

// Lấy lịch sử thanh toán của người dùng
router.get("/history", authMiddleware.authenticate, PaymentController.getUserPaymentHistory)

module.exports = router
