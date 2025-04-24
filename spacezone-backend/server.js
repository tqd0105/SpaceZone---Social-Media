require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");


const app = express();

// 📌 Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, "uploads");
const uploadsPostDir = path.join(uploadsDir, "post");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(uploadsPostDir)) {
  fs.mkdirSync(uploadsPostDir);
}

// 📌 Middleware
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// 📌 Serve static files (Uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📌 Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ ERROR: Chưa cấu hình MONGO_URI trong .env!");
  process.exit(1);
}

// mongoose
//   .connect(MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => {
//     console.error("❌ MongoDB Connection Error:", err);
//     process.exit(1);
//   });

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// 📌 Routes
const postRoutes = require("./Routes/postRoutes");
const commentRoutes = require("./Routes/commentRoutes");
const likeRoutes = require("./Routes/likeRoutes");
const shareRoutes = require("./Routes/shareRoutes");
const userRoutes = require("./Routes/userRoutes");
const authRoutes = require("./Routes/authRoutes");

// 📌 API Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📌 Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ 
    error: "❌ Đã xảy ra lỗi, vui lòng thử lại sau",
    message: err.message 
  });
});

// 📌 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Không tìm thấy route" });
});

// 📌 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📌 Frontend URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log(`📌 MongoDB URI: ${MONGO_URI}`);
  console.log(`📌 API URL: http://localhost:${PORT}/api`);
});
