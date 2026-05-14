const Order = require('../models/Order');
const Product = require('../models/Product');
 
// ✅ Create Order
exports.createOrder = async (req, res) => {
  try {
    const { userId, products, totalPrice, paymentMethod, address } = req.body;

    // ✅ Validation
    if (!userId || !products || !totalPrice || !paymentMethod || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products must be a non-empty array" });
    }

    // Optional: validate each product
    for (let item of products) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({ message: "Invalid product data" });
      }
    }

    const order = new Order({
      userId,
      products,
      totalPrice,
      paymentMethod,
      address
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.removeOrderItem = async (req, res) => {
  try {

    const { id } = req.params;
    const { productId } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // remove selected product
    order.products = order.products.filter(
      (item) => item.productId.toString() !== productId
    );

    // recalculate total
    let totalPrice = 0;

    for (const item of order.products) {

      const product = await Product.findById(item.productId);

      const price =
        product.discountPrice || product.price;

      totalPrice += price * item.quantity;
    }

    order.totalPrice = totalPrice;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Item removed successfully",
      order,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ✅ Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
   const orders = await Order.find()
  .populate("userId", "name email")
  .populate(
    "products.productId",
    "productName price discountPrice image images description"
  )
  .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ✅ Get Orders by User ID
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate(
  'products.productId',
  'productName price discountPrice image images description'
)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("GET USER ORDERS ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ✅ Get Single Order (Extra useful 🔥)
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
     .populate(
  'products.productId',
  'productName price discountPrice image images description'
);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("GET SINGLE ORDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ✅ Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order
    });

  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ✅ Delete Order (Optional but useful)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};