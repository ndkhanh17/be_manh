const { body } = require("express-validator")

const orderValidation = {
  createOrder: [
    body("items")
      .notEmpty()
      .withMessage("Items are required")
      .isArray()
      .withMessage("Items must be an array")
      .custom((items) => items.length > 0)
      .withMessage("Order must contain at least one item"),

    body("items.*.id").notEmpty().withMessage("Item ID is required"),

    body("items.*.quantity")
      .notEmpty()
      .withMessage("Item quantity is required")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),

    body("customerInfo").notEmpty().withMessage("Customer information is required"),

    body("customerInfo.fullName").notEmpty().withMessage("Customer name is required"),

    body("customerInfo.phone").notEmpty().withMessage("Customer phone is required"),

    body("customerInfo.address").notEmpty().withMessage("Customer address is required"),

    body("paymentMethod")
      .notEmpty()
      .withMessage("Payment method is required")
      .isIn(["cod", "bank"])
      .withMessage("Invalid payment method"),
  ],

  updateOrderStatus: [
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["pending", "processing", "completed", "cancelled"])
      .withMessage("Invalid status"),
  ],
}

module.exports = orderValidation
