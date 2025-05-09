const { body } = require("express-validator")

const authValidation = {
  register: [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),

    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],

  login: [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email"),

    body("password").notEmpty().withMessage("Password is required"),
  ],
}

module.exports = authValidation
