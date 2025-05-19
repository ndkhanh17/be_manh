const crypto = require("crypto")
const axios = require("axios")
const querystring = require("querystring")
const PaymentModel = require("../models/payment.model")
const OrderService = require("../services/order.service")
const { ObjectId } = require("mongodb")

// Khởi tạo các SDK thanh toán
let stripe
let paypal
let paypalClient

// Khởi tạo Stripe nếu có API key
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
}

// Khởi tạo PayPal nếu có client ID và secret
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
  paypal = require("@paypal/checkout-server-sdk")
  const environment =
    process.env.NODE_ENV === "production"
      ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
      : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  paypalClient = new paypal.core.PayPalHttpClient(environment)
}

const PaymentService = {
  async createPayment(order) {
    // Kiểm tra xem đơn hàng đã có thanh toán chưa
    const existingPayment = await PaymentModel.findByOrderId(order._id)
    if (existingPayment && existingPayment.status === "succeeded") {
      throw new Error("Order has already been paid")
    }

    // Tạo mã thanh toán duy nhất
    const paymentId = crypto.randomBytes(16).toString("hex")

    // Tạo bản ghi thanh toán
    const paymentData = {
      paymentId,
      orderId: order._id,
      userId: order.customerInfo.userId ? new ObjectId(order.customerInfo.userId) : null,
      amount: order.total,
      currency: "VND",
      paymentMethod: order.paymentMethod || "demo",
      status: "pending",
      metadata: {
        orderNumber: order.orderNumber || order._id.toString(),
        customerName: order.customerInfo.fullName,
        customerEmail: order.customerInfo.email,
        customerPhone: order.customerInfo.phone,
      },
    }

    const payment = await PaymentModel.create(paymentData)

    return {
      paymentId: payment.paymentId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      _id: payment._id,
    }
  },

  async processPayment(paymentId) {
    // Tìm payment
    const payment = await PaymentModel.findById(paymentId)
    if (!payment) {
      throw new Error("Payment not found")
    }

    if (payment.status === "succeeded") {
      return {
        paymentId: payment.paymentId,
        status: payment.status,
        message: "Payment has already been processed",
      }
    }

    // Cập nhật trạng thái thanh toán thành công
    const updateData = {
      status: "succeeded",
      paidAt: new Date(),
    }

    const updatedPayment = await PaymentModel.update(payment._id, updateData)

    // Cập nhật trạng thái đơn hàng
    await OrderService.updateOrderStatus(updatedPayment.orderId, "processing")

    return {
      paymentId: updatedPayment.paymentId,
      status: updatedPayment.status,
      message: "Payment processed successfully",
    }
  },

  async getPaymentStatus(paymentId) {
    const payment = await PaymentModel.findById(paymentId)
    if (!payment) {
      throw new Error("Payment not found")
    }

    return {
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
    }
  },

  // VNPay methods
  async createVnpayPaymentUrl(order, ipAddr, bankCode = "") {
    if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET) {
      throw new Error("VNPay configuration is missing")
    }

    // Tạo bản ghi thanh toán
    const paymentData = {
      paymentIntentId: `vnp_${Date.now()}`,
      orderId: order._id,
      userId: order.customerInfo.userId ? new ObjectId(order.customerInfo.userId) : null,
      amount: order.total,
      currency: "VND",
      paymentMethod: "vnpay",
      status: "pending",
      metadata: {
        orderNumber: order.orderNumber || order._id.toString(),
        customerName: order.customerInfo.fullName,
        customerEmail: order.customerInfo.email,
        customerPhone: order.customerInfo.phone,
      },
    }

    const payment = await PaymentModel.create(paymentData)

    // Chuẩn bị dữ liệu cho VNPay
    const tmnCode = process.env.VNPAY_TMN_CODE
    const secretKey = process.env.VNPAY_HASH_SECRET
    const returnUrl = `${process.env.API_URL}/api/payment/vnpay/callback`

    const date = new Date()
    const createDate = `${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getDate()).slice(
      -2,
    )}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(-2)}${("0" + date.getSeconds()).slice(-2)}`

    const orderId = payment._id.toString()
    const amount = Math.round(order.total) // VNPay yêu cầu số nguyên

    const vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
      vnp_OrderType: "billpayment",
      vnp_Amount: amount * 100, // VNPay yêu cầu số tiền * 100
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    }

    // Thêm mã ngân hàng nếu có
    if (bankCode) {
      vnpParams.vnp_BankCode = bankCode
    }

    // Sắp xếp các tham số theo thứ tự a-z
    const sortedParams = {}
    Object.keys(vnpParams)
      .sort()
      .forEach((key) => {
        sortedParams[key] = vnpParams[key]
      })

    // Tạo chuỗi ký
    const signData = querystring.stringify(sortedParams, { encode: false })
    const hmac = crypto.createHmac("sha512", secretKey)
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex")

    // Thêm chữ ký vào params
    sortedParams.vnp_SecureHash = signed

    // Tạo URL thanh toán
    const vnpUrl = `${process.env.VNPAY_URL}?${querystring.stringify(sortedParams)}`

    return vnpUrl
  },

  async processVnpayCallback(vnpParams) {
    if (!process.env.VNPAY_HASH_SECRET) {
      throw new Error("VNPay configuration is missing")
    }

    const secureHash = vnpParams.vnp_SecureHash
    delete vnpParams.vnp_SecureHash
    delete vnpParams.vnp_SecureHashType

    // Sắp xếp các tham số theo thứ tự a-z
    const sortedParams = {}
    Object.keys(vnpParams)
      .sort()
      .forEach((key) => {
        sortedParams[key] = vnpParams[key]
      })

    // Tạo chuỗi ký
    const signData = querystring.stringify(sortedParams, { encode: false })
    const hmac = crypto.createHmac("sha512", process.env.VNPAY_HASH_SECRET)
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex")

    // Kiểm tra chữ ký
    if (secureHash !== signed) {
      throw new Error("Invalid signature")
    }

    // Kiểm tra kết quả thanh toán
    const responseCode = vnpParams.vnp_ResponseCode
    const orderId = vnpParams.vnp_TxnRef

    // Tìm payment theo orderId
    const db = require("../config/database").getDb()
    const payment = await db.collection("payments").findOne({ _id: new ObjectId(orderId) })

    if (!payment) {
      throw new Error("Payment not found")
    }

    // Cập nhật trạng thái thanh toán
    let status = "failed"
    let message = "Thanh toán thất bại"

    if (responseCode === "00") {
      status = "succeeded"
      message = "Thanh toán thành công"

      // Cập nhật payment
      await PaymentModel.update(payment._id, {
        status: "succeeded",
        paidAt: new Date(),
        transactionDetails: vnpParams,
      })

      // Cập nhật trạng thái đơn hàng
      await OrderService.updateOrderStatus(payment.orderId, "processing")
    } else {
      // Cập nhật payment thất bại
      await PaymentModel.update(payment._id, {
        status: "failed",
        transactionDetails: vnpParams,
      })
    }

    return {
      success: status === "succeeded",
      message,
      orderId: payment.orderId,
    }
  },

  // MoMo methods
  async createMomoPaymentUrl(order) {
    if (
      !process.env.MOMO_PARTNER_CODE ||
      !process.env.MOMO_ACCESS_KEY ||
      !process.env.MOMO_SECRET_KEY ||
      !process.env.MOMO_ENDPOINT
    ) {
      throw new Error("MoMo configuration is missing")
    }

    // Tạo bản ghi thanh toán
    const paymentData = {
      paymentIntentId: `momo_${Date.now()}`,
      orderId: order._id,
      userId: order.customerInfo.userId ? new ObjectId(order.customerInfo.userId) : null,
      amount: order.total,
      currency: "VND",
      paymentMethod: "momo",
      status: "pending",
      metadata: {
        orderNumber: order.orderNumber || order._id.toString(),
        customerName: order.customerInfo.fullName,
        customerEmail: order.customerInfo.email,
        customerPhone: order.customerInfo.phone,
      },
    }

    const payment = await PaymentModel.create(paymentData)

    // Chuẩn bị dữ liệu cho MoMo
    const partnerCode = process.env.MOMO_PARTNER_CODE
    const accessKey = process.env.MOMO_ACCESS_KEY
    const secretKey = process.env.MOMO_SECRET_KEY
    const returnUrl = `${process.env.API_URL}/api/payment/momo/callback`
    const notifyUrl = `${process.env.API_URL}/api/payment/momo/notify`
    const requestId = `${Date.now()}`
    const orderId = payment._id.toString()
    const orderInfo = `Thanh toan don hang ${order._id}`
    const amount = Math.round(order.total).toString()
    const extraData = ""

    // Tạo chữ ký
    const rawSignature = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&returnUrl=${returnUrl}&notifyUrl=${notifyUrl}&extraData=${extraData}`
    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex")

    // Tạo request body
    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      returnUrl,
      notifyUrl,
      extraData,
      requestType: "captureMoMoWallet",
      signature,
    }

    // Gọi API MoMo
    const response = await axios.post(process.env.MOMO_ENDPOINT, requestBody)

    if (response.data.errorCode !== 0) {
      throw new Error(`MoMo error: ${response.data.localMessage}`)
    }

    return response.data.payUrl
  },

  async processMomoCallback(momoParams) {
    // Kiểm tra kết quả thanh toán
    const resultCode = momoParams.resultCode
    const orderId = momoParams.orderId

    // Tìm payment theo orderId
    const db = require("../config/database").getDb()
    const payment = await db.collection("payments").findOne({ _id: new ObjectId(orderId) })

    if (!payment) {
      throw new Error("Payment not found")
    }

    // Cập nhật trạng thái thanh toán
    let status = "failed"
    let message = "Thanh toán thất bại"

    if (resultCode === "0") {
      status = "succeeded"
      message = "Thanh toán thành công"

      // Cập nhật payment
      await PaymentModel.update(payment._id, {
        status: "succeeded",
        paidAt: new Date(),
        transactionDetails: momoParams,
      })

      // Cập nhật trạng thái đơn hàng
      await OrderService.updateOrderStatus(payment.orderId, "processing")
    } else {
      // Cập nhật payment thất bại
      await PaymentModel.update(payment._id, {
        status: "failed",
        transactionDetails: momoParams,
      })
    }

    return {
      success: status === "succeeded",
      message,
      orderId: payment.orderId,
    }
  },

  // PayPal methods
  async createPaypalOrder(order) {
    if (!paypal) {
      throw new Error("PayPal is not configured")
    }

    // Tạo bản ghi thanh toán
    const paymentData = {
      paymentIntentId: `pp_${Date.now()}`,
      orderId: order._id,
      userId: order.customerInfo.userId ? new ObjectId(order.customerInfo.userId) : null,
      amount: order.total,
      currency: "USD", // PayPal sử dụng USD
      paymentMethod: "paypal",
      status: "pending",
      metadata: {
        orderNumber: order.orderNumber || order._id.toString(),
        customerName: order.customerInfo.fullName,
        customerEmail: order.customerInfo.email,
        customerPhone: order.customerInfo.phone,
      },
    }

    const payment = await PaymentModel.create(paymentData)

    // Chuyển đổi VND sang USD (giả định tỷ giá 1 USD = 23,000 VND)
    const amountUSD = (order.total / 23000).toFixed(2)

    // Tạo request PayPal
    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer("return=representation")
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: payment._id.toString(),
          description: `Order ${order._id}`,
          amount: {
            currency_code: "USD",
            value: amountUSD,
          },
        },
      ],
      application_context: {
        brand_name: "AyaBook",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      },
    })

    // Gọi API PayPal
    const response = await paypalClient.execute(request)

    // Cập nhật payment với paypalOrderId
    await PaymentModel.update(payment._id, {
      paypalOrderId: response.result.id,
    })

    return {
      paypalOrderId: response.result.id,
      status: response.result.status,
      links: response.result.links,
    }
  },

  async capturePaypalOrder(paypalOrderId) {
    if (!paypal) {
      throw new Error("PayPal is not configured")
    }

    // Tìm payment theo paypalOrderId
    const db = require("../config/database").getDb()
    const payment = await db.collection("payments").findOne({ paypalOrderId })

    if (!payment) {
      throw new Error("Payment not found")
    }

    // Tạo request capture
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId)
    request.requestBody({})

    // Gọi API PayPal
    const response = await paypalClient.execute(request)

    // Cập nhật payment
    if (response.result.status === "COMPLETED") {
      await PaymentModel.update(payment._id, {
        status: "succeeded",
        paidAt: new Date(),
        transactionDetails: response.result,
      })

      // Cập nhật trạng thái đơn hàng
      await OrderService.updateOrderStatus(payment.orderId, "processing")

      return {
        success: true,
        message: "Payment completed successfully",
        details: response.result,
      }
    } else {
      await PaymentModel.update(payment._id, {
        status: "failed",
        transactionDetails: response.result,
      })

      return {
        success: false,
        message: "Payment failed",
        details: response.result,
      }
    }
  },

  // Stripe methods
  async createStripeCheckoutSession(order) {
    if (!stripe) {
      throw new Error("Stripe is not configured")
    }

    // Tạo bản ghi thanh toán
    const paymentData = {
      paymentIntentId: `st_${Date.now()}`,
      orderId: order._id,
      userId: order.customerInfo.userId ? new ObjectId(order.customerInfo.userId) : null,
      amount: order.total,
      currency: "USD", // Stripe sử dụng USD
      paymentMethod: "stripe",
      status: "pending",
      metadata: {
        orderNumber: order.orderNumber || order._id.toString(),
        customerName: order.customerInfo.fullName,
        customerEmail: order.customerInfo.email,
        customerPhone: order.customerInfo.phone,
      },
    }

    const payment = await PaymentModel.create(paymentData)

    // Chuyển đổi VND sang USD (giả định tỷ giá 1 USD = 23,000 VND)
    const amountUSD = Math.round((order.total / 23000) * 100) // Stripe yêu cầu số tiền tính bằng cent

    // Tạo line items từ các sản phẩm trong đơn hàng
    const lineItems = order.items.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            description: item.author ? `Author: ${item.author}` : undefined,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round((item.price / 23000) * 100), // Chuyển đổi VND sang USD cent
        },
        quantity: item.quantity,
      }
    })

    // Thêm phí vận chuyển nếu có
    if (order.shippingFee && order.shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping Fee",
          },
          unit_amount: Math.round((order.shippingFee / 23000) * 100),
        },
        quantity: 1,
      })
    }

    // Tạo Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        paymentId: payment._id.toString(),
        orderId: order._id.toString(),
      },
      client_reference_id: payment._id.toString(),
    })

    // Cập nhật payment với stripeSessionId
    await PaymentModel.update(payment._id, {
      stripeSessionId: session.id,
    })

    return {
      sessionId: session.id,
      url: session.url,
    }
  },

  async handleStripeWebhook(payload, signature) {
    if (!stripe) {
      throw new Error("Stripe is not configured")
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe webhook secret is missing")
    }

    // Xác thực webhook
    let event
    try {
      event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`)
    }

    // Xử lý sự kiện
    if (event.type === "checkout.session.completed") {
      const session = event.data.object

      // Tìm payment theo stripeSessionId
      const db = require("../config/database").getDb()
      const payment = await db.collection("payments").findOne({ stripeSessionId: session.id })

      if (!payment) {
        throw new Error("Payment not found")
      }

      // Cập nhật payment
      await PaymentModel.update(payment._id, {
        status: "succeeded",
        paidAt: new Date(),
        transactionDetails: session,
      })

      // Cập nhật trạng thái đơn hàng
      await OrderService.updateOrderStatus(payment.orderId, "processing")
    }

    return { received: true }
  },

  // Lấy lịch sử thanh toán của người dùng
  async getUserPaymentHistory(userId, options = {}) {
    return PaymentModel.getUserPayments(userId, options)
  },
}

module.exports = PaymentService
