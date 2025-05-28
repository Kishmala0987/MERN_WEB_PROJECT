const Order = require("../models/order");
const Product = require("../models/product");
const fs = require("fs");
const path = require("path");

exports.postProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      specifications,
      shippingInfo,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({
        success: false,
        errors: ["All required fields must be provided"],
      });
    }

    // Get image files from request
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        errors: ["At least one product image is required"],
      });
    }

    const photos = req.files.map((file) => file.filename);

    // Create new product
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      quantity: parseInt(quantity),
      photos,
      specifications, // Match the model's field name
      shippingInfo, // Match the model's field name
      seller: req.user._id, // This comes from auth middleware
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Product upload error:", error);
    res.status(500).json({
      success: false,
      errors: [error.message],
    });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    console.log("Fetching products for seller:", req.user._id); // Debug log
    const products = await Product.find({ seller: req.user._id })
      .select("name price photos quantity category status createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({
      success: false,
      errors: [error.message],
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        errors: ["Product not found or unauthorized"],
      });
    }

    // Delete product images from uploads folder
    product.photos.forEach((photo) => {
      const imagePath = path.join(__dirname, "../uploads", photo);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      errors: [error.message],
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        errors: ["Product not found or unauthorized"],
      });
    }

    // Add full URLs for photos
    const productWithUrls = {
      ...product.toObject(),
      photos: product.photos.map((photo) => ({
        filename: photo,
        url: `${process.env.API_URL}/uploads/${photo}`,
      })),
    };

    res.status(200).json({
      success: true,
      product: productWithUrls,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      errors: [error.message],
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        errors: ["Product not found or unauthorized"],
      });
    }

    const updateData = { ...req.body };

    // Handle photos
    const existingPhotos = req.body.existingPhotos || [];
    const newPhotos = req.files ? req.files.map((file) => file.filename) : [];

    // Remove deleted photos
    product.photos.forEach((photo) => {
      if (!existingPhotos.includes(photo)) {
        const imagePath = path.join(__dirname, "../uploads", photo);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    // Combine existing and new photos
    updateData.photos = [...existingPhotos, ...newPhotos];

    // Update numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.quantity)
      updateData.quantity = parseInt(updateData.quantity);

    // Update the product
    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      errors: [error.message],
    });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    console.log("Fetching orders for seller:", req.user._id);

    // Find orders where the seller ID matches in the items array
    const orders = await Order.find({
      "items.seller": req.user._id,
    })
      .populate("customer", "firstName lastName email")
      .populate("items.product", "name photos price")
      .sort("-createdAt");

    console.log("Found orders:", orders.length);

    // Filter order items to only include those belonging to this seller
    const processedOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.filter(
        (item) => item.seller.toString() === req.user._id.toString()
      ),
    }));

    // Calculate stats
    const stats = {
      totalOrders: processedOrders.length,
      totalRevenue: processedOrders.reduce(
        (total, order) =>
          total +
          order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        0
      ),
      pendingOrders: processedOrders.filter((order) =>
        order.items.some((item) => item.status === "pending")
      ).length,
      shippedOrders: processedOrders.filter((order) =>
        order.items.some((item) => item.status === "shipped")
      ).length,
    };

    res.status(200).json({
      success: true,
      orders: processedOrders,
      stats,
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const sellerId = req.user._id;
    
    console.log('Update request:', { orderId, status, sellerId });

    // Validate status
    const validStatuses = ["shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        "items.seller": sellerId // Find order with matching seller ID in items
      },
      {
        $set: {
          "items.$[elem].status": status, // Update matching array element
          "items.$[elem].updatedAt": Date.now()
        }
      },
      {
        arrayFilters: [{ "elem.seller": sellerId }], // Match seller ID in array element
        new: true, // Return updated document
        runValidators: true
      }
    ).populate('items.product', 'name photos');

    if (!order) {
      console.log('Order not found:', { orderId, sellerId });
      return res.status(404).json({
        success: false,
        message: "Order not found or unauthorized"
      });
    }

    // Filter items to only include those belonging to this seller
    const sellerItems = order.items.filter(
      item => item.seller.toString() === sellerId.toString()
    );

    console.log('Order updated:', {
      orderId: order._id,
      status,
      itemsCount: sellerItems.length
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        ...order.toObject(),
        items: sellerItems // Only return seller's items
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};
