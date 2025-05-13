const BookModel = require("../models/book.model")
const CategoryModel = require("../models/category.model")
const { ObjectId } = require("mongoose").Types

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
      try {
        // Nếu category là một ID (string), kiểm tra bằng ID
        if (typeof bookData.category === "string" && bookData.category.length === 24) {
          const category = await CategoryModel.findById(bookData.category)
          if (!category) {
            throw new Error("Category not found with provided ID")
          }
        }
        // Nếu category là tên danh mục, kiểm tra bằng tên
        else if (typeof bookData.category === "string") {
          const category = await CategoryModel.findByName(bookData.category)
          if (!category) {
            throw new Error("Category not found with provided name")
          }
        }
      } catch (error) {
        console.error("Error validating category:", error.message)
        // Nếu không tìm thấy danh mục, tạo một danh mục mới
        console.log("Creating book without category validation")
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
      try {
        // Nếu category là một ID (string), kiểm tra bằng ID
        if (typeof updateData.category === "string" && updateData.category.length === 24) {
          const category = await CategoryModel.findById(updateData.category)
          if (!category) {
            throw new Error("Category not found with provided ID")
          }
        }
        // Nếu category là tên danh mục, kiểm tra bằng tên
        else if (typeof updateData.category === "string") {
          const category = await CategoryModel.findByName(updateData.category)
          if (!category) {
            throw new Error("Category not found with provided name")
          }
        }
      } catch (error) {
        console.error("Error validating category:", error.message)
        // Nếu không tìm thấy danh mục, bỏ qua validation
        console.log("Updating book without category validation")
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

  async getBooksByCategory(categoryId, options = {}) {
    // Validate category
    const category = await CategoryModel.findById(categoryId)
    if (!category) {
      throw new Error("Category not found")
    }

    const { page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    const query = { category: new ObjectId(categoryId) }

    return BookModel.getAll(query, {
      skip,
      limit,
      sort: { createdAt: -1 },
    })
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
