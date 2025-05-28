const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();
const dbpath = process.env.DB_PATH;
const rootDir = require("./utils/pathUtil");

// Initialize express
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Static files
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/api/uploads", express.static(path.join(rootDir, "uploads")));

// Routes
const authRouter = require("./routes/authRouter");
const sellerRouter = require('./routes/sellerRouter');
const userRouter = require('./routes/userRouter');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/ordersRouter');

app.use('/api/auth', authRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/products', userRouter); 
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    errors: [err.message || 'Internal server error']
  });
});

// Server startup
const PORT = process.env.PORT || 5000;

mongoose
  .connect(dbpath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}
