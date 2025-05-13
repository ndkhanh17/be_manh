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

// Thay đổi route tìm kiếm để rõ ràng hơn
router.get("/search", BookController.searchBooks)

// Thêm route lấy sách theo danh mục
router.get("/category/:categoryId", BookController.getBooksByCategory)

module.exports = router
