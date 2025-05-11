const express = require("express")
const router = express.Router()
const BookController = require("../controllers/book.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validator.middleware")
const bookValidation = require("../validations/book.validation")

// Public routes
router.get("/", BookController.getAllBooks)
router.get("/bestsellers", BookController.getBestsellers)
router.get("/new-arrivals", BookController.getNewArrivals)
router.get("/:id", BookController.getBookById)

// Protected routes (admin only)
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  validate(bookValidation.createBook),
  BookController.createBook,
)

router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  validate(bookValidation.updateBook),
  BookController.updateBook,
)

router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize("admin"), BookController.deleteBook)

// Thêm route tìm kiếm nâng cao
router.get("/search", BookController.searchBooks)

module.exports = router
