const PaymentService = require("../services/payment.service")
const OrderService = require("../services/order.service")

const PaymentController = {
  // Tạo thanh toán mới cho đơn hàng
  async createPayment(req, res, next) {
    try {
      const { orderId } = req.body

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        })
      }

      // Lấy thông tin đơn hàng
      const order = await OrderService.getOrderById(orderId)

      // Tạo thanh toán
      const payment = await PaymentService.createPayment(order)

      res.status(200).json({
        success: true,
        message: "Payment created successfully",
        data: payment,
      })
    } catch (error) {
      next(error)
    }
  },

  // Xử lý thanh toán (luôn trả về thành công)
  async processPayment(req, res, next) {
    try {
      const { paymentId } = req.body

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is required",
        })
      }

      // Xử lý thanh toán
      const result = await PaymentService.processPayment(paymentId)

      res.status(200).json({
        success: true,
        message: "Payment processed successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  // Kiểm tra trạng thái thanh toán
  async getPaymentStatus(req, res, next) {
    try {
      const { paymentId } = req.params

      const payment = await PaymentService.getPaymentStatus(paymentId)

      res.status(200).json({
        success: true,
        message: "Payment status retrieved successfully",
        data: payment,
      })
    } catch (error) {
      next(error)
    }
  },

  // Lấy lịch sử thanh toán của người dùng
  async getUserPaymentHistory(req, res, next) {
    try {
      const userId = req.user.id
      const { page = 1, limit = 10 } = req.query

      const options = {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
      }

      const history = await PaymentService.getUserPaymentHistory(userId, options)

      res.status(200).json({
        success: true,
        message: "Payment history retrieved successfully",
        data: history,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = PaymentController
