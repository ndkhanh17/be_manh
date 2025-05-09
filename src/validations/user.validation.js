const { body } = require("express-validator")

const userValidation = {
  updateUser: [
    body("name").optional().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),

    body("email").optional().isEmail().withMessage("Please provide a valid email"),

    body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],

  updateUserRole: [
    body("role").notEmpty().withMessage("Role is required").isIn(["customer", "admin"]).withMessage("Invalid role"),
  ],
}

module.exports = userValidation
