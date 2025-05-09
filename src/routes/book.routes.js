const express = require("express")
const router = express.Router()
const BookController = require("../controllers/book.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validator.middleware")
const bookValidation = require("../validations/book.validation")

// Get all books (public)
router.get("/", BookController.getAllBooks)

// Get book by ID (public)
router.get("/:id", BookController.getBookById)

// Get books by category (public)
router.get("/category/:category", BookController.getBooksByCategory)

// Get best sellers (public)
router.get("/bestsellers/list", BookController.getBestSellers)

// Get new arrivals (public)
router.get("/new/arrivals", BookController.getNewArrivals)

// Create a new book (admin only)
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  validate(bookValidation.createBook),
  BookController.createBook,
)

// Update a book (admin only)
router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  validate(bookValidation.updateBook),
  BookController.updateBook,
)

// Delete a book (admin only)
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize("admin"), BookController.deleteBook)

module.exports = router
