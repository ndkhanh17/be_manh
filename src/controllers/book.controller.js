const BookService = require("../services/book.service")

const BookController = {
  async getAllBooks(req, res, next) {
    try {
      const { page = 1, limit = 10, category, search, sort } = req.query

      const query = {}
      const options = {
        skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
        limit: Number.parseInt(limit),
      }

      // Add category filter if provided
      if (category) {
        query.category = category
      }

      // Add sorting if provided
      if (sort) {
        const [field, order] = sort.split(":")
        options.sort = { [field]: order === "desc" ? -1 : 1 }
      }

      let books

      // If search term is provided, use search method
      if (search) {
        books = await BookService.searchBooks(search, options)
      } else {
        books = await BookService.getAllBooks(query, options)
      }

      res.status(200).json({
        success: true,
        count: books.length,
        data: books,
      })
    } catch (error) {
      next(error)
    }
  },

  async getBookById(req, res, next) {
    try {
      const { id } = req.params
      const book = await BookService.getBookById(id)

      res.status(200).json({
        success: true,
        data: book,
      })
    } catch (error) {
      next(error)
    }
  },

  async createBook(req, res, next) {
    try {
      const bookData = req.body
      const book = await BookService.createBook(bookData)

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
      const { id } = req.params
      const updateData = req.body
      const book = await BookService.updateBook(id, updateData)

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
      const { id } = req.params
      await BookService.deleteBook(id)

      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  },

  async getBooksByCategory(req, res, next) {
    try {
      const { category } = req.params
      const { page = 1, limit = 10 } = req.query

      const options = {
        skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
        limit: Number.parseInt(limit),
      }

      const books = await BookService.getBooksByCategory(category, options)

      res.status(200).json({
        success: true,
        count: books.length,
        data: books,
      })
    } catch (error) {
      next(error)
    }
  },

  async getBestSellers(req, res, next) {
    try {
      const { limit = 5 } = req.query
      const books = await BookService.getBestSellers(Number.parseInt(limit))

      res.status(200).json({
        success: true,
        count: books.length,
        data: books,
      })
    } catch (error) {
      next(error)
    }
  },

  async getNewArrivals(req, res, next) {
    try {
      const { limit = 5 } = req.query
      const books = await BookService.getNewArrivals(Number.parseInt(limit))

      res.status(200).json({
        success: true,
        count: books.length,
        data: books,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = BookController
