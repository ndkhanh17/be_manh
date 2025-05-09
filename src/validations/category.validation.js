const { body } = require("express-validator")

const categoryValidation = {
  createCategory: [
    body("name")
      .notEmpty()
      .withMessage("Category name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Category name must be between 2 and 50 characters"),

    body("description").optional().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  ],

  updateCategory: [
    body("name")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("Category name must be between 2 and 50 characters"),

    body("description").optional().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  ],
}

module.exports = categoryValidation
