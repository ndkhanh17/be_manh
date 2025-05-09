const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Default error status and message
  let statusCode = 500
  let message = "Server Error"

  // Handle specific error types
  if (err.message === "User already exists with this email") {
    statusCode = 400
    message = err.message
  } else if (err.message === "Invalid credentials") {
    statusCode = 401
    message = err.message
  } else if (err.message === "Not authorized to access this resource") {
    statusCode = 403
    message = err.message
  } else if (err.message.includes("not found")) {
    statusCode = 404
    message = err.message
  } else if (err.message === "Invalid token") {
    statusCode = 401
    message = err.message
  } else if (err.message.includes("already exists")) {
    statusCode = 400
    message = err.message
  } else if (err.message.includes("Not enough stock")) {
    statusCode = 400
    message = err.message
  }

  res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = errorHandler
