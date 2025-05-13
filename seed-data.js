const { MongoClient, ObjectId } = require("mongodb")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Kết nối đến MongoDB
async function seedDatabase() {
  let client
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error("MONGODB_URI không được định nghĩa trong file .env")
    }

    console.log("Đang kết nối đến MongoDB...")
    client = new MongoClient(uri)
    await client.connect()

    // Lấy tên database từ URI hoặc sử dụng mặc định
    const dbName = uri.split("/").pop().split("?")[0] || "ayabook"
    console.log("Sử dụng database:", dbName)

    const db = client.db(dbName)
    console.log("Kết nối MongoDB thành công!")

    // Xóa dữ liệu cũ (nếu cần)
    if (process.env.CLEAR_DB === "true") {
      console.log("Đang xóa dữ liệu cũ...")
      await db.collection("users").deleteMany({})
      await db.collection("categories").deleteMany({})
      await db.collection("books").deleteMany({})
      await db.collection("orders").deleteMany({})
      console.log("Đã xóa dữ liệu cũ thành công!")
    }

    // Tạo dữ liệu người dùng
    console.log("Đang tạo dữ liệu người dùng...")
    const users = await seedUsers(db)
    console.log(`Đã tạo ${users.length} người dùng!`)

    // Tạo dữ liệu danh mục
    console.log("Đang tạo dữ liệu danh mục...")
    const categories = await seedCategories(db)
    console.log(`Đã tạo ${categories.length} danh mục!`)

    // Tạo dữ liệu sách
    console.log("Đang tạo dữ liệu sách...")
    const books = await seedBooks(db, categories)
    console.log(`Đã tạo ${books.length} sách!`)

    // Tạo dữ liệu đơn hàng
    console.log("Đang tạo dữ liệu đơn hàng...")
    const orders = await seedOrders(db, users, books)
    console.log(`Đã tạo ${orders.length} đơn hàng!`)

    console.log("Tạo dữ liệu mẫu thành công!")
  } catch (error) {
    console.error("Lỗi khi tạo dữ liệu mẫu:", error)
  } finally {
    if (client) {
      await client.close()
      console.log("Đã đóng kết nối MongoDB")
    }
  }
}

// Tạo dữ liệu người dùng
async function seedUsers(db) {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash("password123", salt)

  const users = [
    {
      name: "Admin User",
      email: "admin@ayabook.com",
      password: hashedPassword,
      role: "admin",
      phone: "0987654321",
      address: "123 Đường Admin, Quận 1, TP.HCM",
      createdAt: new Date(),
    },
    {
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      password: hashedPassword,
      role: "customer",
      phone: "0901234567",
      address: "456 Đường Khách Hàng, Quận 2, TP.HCM",
      createdAt: new Date(),
    },
    {
      name: "Trần Thị B",
      email: "tranthib@example.com",
      password: hashedPassword,
      role: "customer",
      phone: "0912345678",
      address: "789 Đường Người Dùng, Quận 3, TP.HCM",
      createdAt: new Date(),
    },
  ]

  const result = await db.collection("users").insertMany(users)
  return Object.values(result.insertedIds).map((id, index) => ({
    ...users[index],
    _id: id,
  }))
}

// Tạo dữ liệu danh mục
async function seedCategories(db) {
  const categories = [
    {
      name: "Văn học",
      description: "Sách văn học Việt Nam và nước ngoài",
      createdAt: new Date(),
    },
    {
      name: "Kinh tế",
      description: "Sách về kinh tế, kinh doanh và tài chính",
      createdAt: new Date(),
    },
    {
      name: "Kỹ năng sống",
      description: "Sách về phát triển bản thân và kỹ năng sống",
      createdAt: new Date(),
    },
    {
      name: "Thiếu nhi",
      description: "Sách dành cho trẻ em và thiếu niên",
      createdAt: new Date(),
    },
    {
      name: "Ngoại ngữ",
      description: "Sách học ngoại ngữ",
      createdAt: new Date(),
    },
  ]

  const result = await db.collection("categories").insertMany(categories)
  return Object.values(result.insertedIds).map((id, index) => ({
    ...categories[index],
    _id: id,
  }))
}

// Tạo dữ liệu sách
async function seedBooks(db, categories) {
  const books = [
    // Văn học
    {
      title: "Nhà Giả Kim",
      author: "Paulo Coelho",
      description:
        "Nhà giả kim là cuốn sách được xuất bản lần đầu ở Brasil năm 1988, và là cuốn sách nổi tiếng nhất của nhà văn Paulo Coelho. Tác phẩm này đã được dịch ra 67 ngôn ngữ và bán ra tới 95 triệu bản, trở thành một trong những cuốn sách bán chạy nhất mọi thời đại.",
      price: 79000,
      stock: 100,
      category: categories[0]._id,
      coverImage: "https://salt.tikicdn.com/cache/w1200/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
      isBestseller: true,
      soldCount: 120,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Đắc Nhân Tâm",
      author: "Dale Carnegie",
      description:
        "Đắc nhân tâm là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại do Dale Carnegie viết và đã được xuất bản lần đầu vào năm 1936.",
      price: 88000,
      stock: 150,
      category: categories[0]._id,
      coverImage: "https://salt.tikicdn.com/cache/w1200/ts/product/df/7d/da/d340edda2b0eacb7ddc47537cddb5e08.jpg",
      isBestseller: true,
      soldCount: 150,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Kinh tế
    {
      title: "Nghĩ Giàu Làm Giàu",
      author: "Napoleon Hill",
      description:
        "Nghĩ giàu làm giàu là một quyển sách truyền cảm hứng về làm giàu, được viết bởi Napoleon Hill vào năm 1937 và được xuất bản lần đầu trong thời kỳ Đại suy thoái.",
      price: 95000,
      stock: 80,
      category: categories[1]._id,
      coverImage: "https://salt.tikicdn.com/cache/w1200/ts/product/7c/e8/34/4d3636aadb471cad0bf2f45089f4b536.jpg",
      isBestseller: true,
      soldCount: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Người Giàu Có Nhất Thành Babylon",
      author: "George S. Clason",
      description:
        "Người giàu có nhất thành Babylon là một cuốn sách truyền cảm hứng về tài chính cá nhân được viết bởi George Samuel Clason và được xuất bản lần đầu vào năm 1926.",
      price: 69000,
      stock: 120,
      category: categories[1]._id,
      coverImage: "https://salt.tikicdn.com/cache/w1200/ts/product/0b/2c/d9/cf35fba65ed6dd4b7c91a4f9cf3d8388.jpg",
      isBestseller: false,
      soldCount: 80,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Kỹ năng sống
    {
      title: "Đời Ngắn Đừng Ngủ Dài",
      author: "Robin Sharma",
      description:
        "Đời ngắn đừng ngủ dài là cuốn sách của tác giả Robin Sharma, xuất bản lần đầu năm 2011, là một trong những cuốn sách bán chạy nhất của tác giả này.",
      price: 75000,
      stock: 90,
      category: categories[2]._id,
      coverImage: "https://salt.tikicdn.com/cache/w1200/ts/product/e1/04/31/7763d9035552760f627c34acfbfb6e96.jpg",
      isBestseller: false,
      soldCount: 70,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
      author: "Rosie Nguyễn",
      description:
        "Tuổi trẻ đáng giá bao nhiêu là cuốn sách của tác giả Rosie Nguyễn được xuất bản lần đầu vào năm 2016 bởi Nhà xuất bản Hội Nhà văn.",
      price: 70000,
      stock: 100,
      category: categories[2]._id,
      coverImage: "https://salt.tikicdn.com/cache/w1200/ts/product/81/79/72/66b5f1959c0282b8c9b2075d179d4b82.jpg",
      isBestseller: true,
      soldCount: 110,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Thiếu nhi
    {
      title: "Dế Mèn Phiêu Lưu Ký",
      author: "Tô Hoài",
      description:
        "Dế Mèn phiêu lưu ký là tác phẩm văn học thiếu nhi của nhà văn Tô Hoài kể về cuộc phiêu lưu của chú Dế Mèn cùng các bạn.",
      price: 55000,
      stock: 200,
      category: categories[3]._id,
      coverImage: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
      isBestseller: true,
      soldCount: 130,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Hoàng Tử Bé",
      author: "Antoine de Saint-Exupéry",
      description:
        "Hoàng tử bé là một tiểu thuyết ngắn nổi tiếng nhất của nhà văn và phi công Pháp Antoine de Saint-Exupéry, được xuất bản năm 1943.",
      price: 60000,
      stock: 150,
      category: categories[3]._id,
      coverImage: "https://salt.tikicdn.com/cache/w1200/ts/product/57/10/5a/7c9f2b774f1c31a4b0bd58f6ebb62c48.jpg",
      isBestseller: false,
      soldCount: 90,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Ngoại ngữ
    {
      title: "English Grammar in Use",
      author: "Raymond Murphy",
      description:
        "English Grammar in Use là cuốn sách học ngữ pháp tiếng Anh nổi tiếng của tác giả Raymond Murphy, được xuất bản bởi Cambridge University Press.",
      price: 120000,
      stock: 80,
      category: categories[4]._id,
      coverImage: "https://salt.tikicdn.com/cache/w1200/ts/product/e1/66/e3/0c1e4d1c065f7ff2b8d7e9cf89e52f44.jpg",
      isBestseller: true,
      soldCount: 95,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Hackers TOEIC Reading",
      author: "David Cho",
      description:
        "Hackers TOEIC Reading là cuốn sách luyện đọc hiểu tiếng Anh theo chuẩn TOEIC, giúp người học nâng cao kỹ năng đọc hiểu và làm bài thi TOEIC hiệu quả.",
      price: 150000,
      stock: 70,
      category: categories[4]._id,
      coverImage: "https://salt.tikicdn.com/cache/w1200/ts/product/b0/57/d0/8c0c842c78b3d2901f1e15c0fe6f0f8f.jpg",
      isBestseller: false,
      soldCount: 85,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const result = await db.collection("books").insertMany(books)
  return Object.values(result.insertedIds).map((id, index) => ({
    ...books[index],
    _id: id,
  }))
}

// Tạo dữ liệu đơn hàng
async function seedOrders(db, users, books) {
  const orderStatuses = ["pending", "processing", "completed", "cancelled"]
  const paymentMethods = ["cod", "bank"]

  const orders = []

  // Tạo đơn hàng cho mỗi người dùng
  for (const user of users.filter((u) => u.role === "customer")) {
    // Mỗi người dùng có 2-4 đơn hàng
    const orderCount = Math.floor(Math.random() * 3) + 2

    for (let i = 0; i < orderCount; i++) {
      // Chọn ngẫu nhiên 1-3 sách cho mỗi đơn hàng
      const itemCount = Math.floor(Math.random() * 3) + 1
      const selectedBooks = []
      const items = []

      for (let j = 0; j < itemCount; j++) {
        let book
        do {
          book = books[Math.floor(Math.random() * books.length)]
        } while (selectedBooks.includes(book._id.toString()))

        selectedBooks.push(book._id.toString())

        const quantity = Math.floor(Math.random() * 3) + 1
        items.push({
          id: book._id,
          title: book.title,
          price: book.price,
          quantity: quantity,
          coverImage: book.coverImage,
        })
      }

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const shippingFee = 30000
      const discount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0
      const total = subtotal + shippingFee - discount

      // Tạo ngày đặt hàng trong khoảng 6 tháng gần đây
      const orderDate = new Date()
      orderDate.setMonth(orderDate.getMonth() - Math.floor(Math.random() * 6))

      orders.push({
        customerInfo: {
          userId: user._id,
          fullName: user.name,
          phone: user.phone,
          email: user.email,
          address: user.address,
        },
        items: items,
        subtotal: subtotal,
        shippingFee: shippingFee,
        discount: discount,
        total: total,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        createdAt: orderDate,
        updatedAt: orderDate,
      })
    }
  }

  const result = await db.collection("orders").insertMany(orders)
  return Object.values(result.insertedIds).map((id, index) => ({
    ...orders[index],
    _id: id,
  }))
}

// Chạy hàm tạo dữ liệu
seedDatabase().catch(console.error)
