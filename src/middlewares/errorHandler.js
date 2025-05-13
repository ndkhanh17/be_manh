const errorHandler = (err, req, res, next) => {
  console.error("Error stack:", err.stack)

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
  } else if (err.message.includes("Chỉ chấp nhận file ảnh")) {
    statusCode = 400
    message = err.message
  } else if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400
    message = "File quá lớn, giới hạn là 5MB"
  } else if (err.code === "ENOENT") {
    statusCode = 500
    message = "Lỗi truy cập file hoặc thư mục"
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
}

module.exports = errorHandler
