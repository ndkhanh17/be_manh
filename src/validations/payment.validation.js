const { body } = require("express-validator")

const paymentValidation = {
  createPayment: [body("orderId").notEmpty().withMessage("Order ID is required")],

  processPayment: [body("paymentId").notEmpty().withMessage("Payment ID is required")],
}

module.exports = paymentValidation
