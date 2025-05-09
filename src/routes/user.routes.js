const express = require("express")
const router = express.Router()
const UserController = require("../controllers/user.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validator.middleware")
const userValidation = require("../validations/user.validation")

// Get current user (authenticated)
router.get("/me", authMiddleware.authenticate, UserController.getCurrentUser)

// Get all users (admin only)
router.get("/", authMiddleware.authenticate, authMiddleware.authorize("admin"), UserController.getAllUsers)

// Get user by ID (admin or self)
router.get("/:id", authMiddleware.authenticate, UserController.getUserById)

// Update user (admin or self)
router.put("/:id", authMiddleware.authenticate, validate(userValidation.updateUser), UserController.updateUser)

// Update user role (admin only)
router.patch(
  "/:id/role",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  validate(userValidation.updateUserRole),
  UserController.updateUserRole,
)

module.exports = router
