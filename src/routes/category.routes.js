const express = require("express")
const router = express.Router()
const CategoryController = require("../controllers/category.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validator.middleware")
const categoryValidation = require("../validations/category.validation")

// Get all categories (public)
router.get("/", CategoryController.getAllCategories)

// Get category by ID (public)
router.get("/:id", CategoryController.getCategoryById)

// Create a new category (admin only)
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  validate(categoryValidation.createCategory),
  CategoryController.createCategory,
)

// Update a category (admin only)
router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  validate(categoryValidation.updateCategory),
  CategoryController.updateCategory,
)

// Delete a category (admin only)
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize("admin"), CategoryController.deleteCategory)

module.exports = router
