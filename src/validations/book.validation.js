const { body } = require("express-validator")

const bookValidation = {
  createBook: [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Title must be between 2 and 100 characters"),

    body("author")
      .notEmpty()
      .withMessage("Author is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Author must be between 2 and 100 characters"),

    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price must be a number")
      .custom((value) => value >= 0)
      .withMessage("Price cannot be negative"),

    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

    body("description").optional().isLength({ max: 2000 }).withMessage("Description cannot exceed 2000 characters"),
  ],

  updateBook: [
    body("title").optional().isLength({ min: 2, max: 100 }).withMessage("Title must be between 2 and 100 characters"),

    body("author").optional().isLength({ min: 2, max: 100 }).withMessage("Author must be between 2 and 100 characters"),

    body("price")
      .optional()
      .isNumeric()
      .withMessage("Price must be a number")
      .custom((value) => value >= 0)
      .withMessage("Price cannot be negative"),

    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

    body("description").optional().isLength({ max: 2000 }).withMessage("Description cannot exceed 2000 characters"),
  ],
}

module.exports = bookValidation
