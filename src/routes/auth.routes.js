const express = require("express")
const router = express.Router()
const AuthController = require("../controllers/auth.controller")
const validate = require("../middlewares/validator.middleware")
const authValidation = require("../validations/auth.validation")

// Register a new user
router.post("/register", validate(authValidation.register), AuthController.register)

// Login user
router.post("/login", validate(authValidation.login), AuthController.login)

module.exports = router
