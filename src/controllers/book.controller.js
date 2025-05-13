const BookService = require("../services/book.service")

const BookController = {
  async getAllBooks(req, res, next) {
    try {
      const result = await BookService.getAllBooks(req.query)

      res.status(200).json({
        success: true,
        message: "Books retrieved successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async getBookById(req, res, next) {
    try {
      const book = await BookService.getBookById(req.params.id)

      res.status(200).json({
        success: true,
        message: "Book retrieved successfully",
        data: book,
      })
    } catch (error) {
      next(error)
    }
  },

  async createBook(req, res, next) {
    try {
      const book = await BookService.createBook(req.body)

      res.status(201).json({
        success: true,
        message: "Book created successfully",
        data: book,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateBook(req, res, next) {
    try {
      const book = await BookService.updateBook(req.params.id, req.body)

      res.status(200).json({
        success: true,
        message: "Book updated successfully",
        data: book,
      })
    } catch (error) {
      next(error)
    }
  },

  async deleteBook(req, res, next) {
    try {
      await BookService.deleteBook(req.params.id)

      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  },

  async getBestsellers(req, res, next) {
    try {
      const books = await BookService.getBestsellers(req.query.limit)

      res.status(200).json({
        success: true,
        message: "Bestsellers retrieved successfully",
        data: books,
      })
    } catch (error) {
      next(error)
    }
  },

  async getNewArrivals(req, res, next) {
    try {
      const books = await BookService.getNewArrivals(req.query.limit)

      res.status(200).json({
        success: true,
        message: "New arrivals retrieved successfully",
        data: books,
      })
    } catch (error) {
      next(error)
    }
  },

  async searchBooks(req, res, next) {
    try {
      const searchParams = {
        name: req.query.name,
        category: req.query.category,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
      }

      const result = await BookService.searchBooks(searchParams)

      res.status(200).json({
        success: true,
        message: "Tìm kiếm sách thành công",
        data: result,
      })
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sách:", error)
      next(error)
    }
  },

  // Thêm phương thức getBooksByCategory
  async getBooksByCategory(req, res, next) {
    try {
      const { categoryId } = req.params
      const { page = 1, limit = 10 } = req.query

      const result = await BookService.getBooksByCategory(categoryId, {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
      })

      res.status(200).json({
        success: true,
        message: "Books by category retrieved successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = BookController
