const BookModel = require("../models/book.model")
const CategoryModel = require("../models/category.model")

const BookService = {
  async getAllBooks(query = {}, options = {}) {
    return BookModel.getAll(query, options)
  },

  async getBookById(id) {
    const book = await BookModel.findById(id)
    if (!book) {
      throw new Error("Book not found")
    }
    return book
  },

  async createBook(bookData) {
    // Validate category if provided
    if (bookData.category) {
      const category = await CategoryModel.findByName(bookData.category)
      if (!category) {
        throw new Error("Invalid category")
      }
    }

    return BookModel.create(bookData)
  },

  async updateBook(id, updateData) {
    // Check if book exists
    const book = await BookModel.findById(id)
    if (!book) {
      throw new Error("Book not found")
    }

    // Validate category if provided
    if (updateData.category) {
      const category = await CategoryModel.findByName(updateData.category)
      if (!category) {
        throw new Error("Invalid category")
      }
    }

    return BookModel.update(id, updateData)
  },

  async deleteBook(id) {
    // Check if book exists
    const book = await BookModel.findById(id)
    if (!book) {
      throw new Error("Book not found")
    }

    return BookModel.delete(id)
  },

  async searchBooks(searchTerm, options = {}) {
    return BookModel.search(searchTerm, options)
  },

  async getBooksByCategory(category, options = {}) {
    // Validate category
    const categoryExists = await CategoryModel.findByName(category)
    if (!categoryExists) {
      throw new Error("Category not found")
    }

    return BookModel.getByCategory(category, options)
  },

  async getBestSellers(limit = 5) {
    return BookModel.getBestSellers(limit)
  },

  async getNewArrivals(limit = 5) {
    return BookModel.getNewArrivals(limit)
  },

  async updateBookStock(id, quantity) {
    // Check if book exists and has enough stock
    const book = await BookModel.findById(id)
    if (!book) {
      throw new Error("Book not found")
    }

    if (book.stock < quantity) {
      throw new Error("Not enough stock")
    }

    return BookModel.updateStock(id, quantity)
  },
}

module.exports = BookService
