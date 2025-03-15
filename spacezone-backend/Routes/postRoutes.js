const express = require("express");
const multer = require("multer");
const Post = require("../models/Post");
const path = require("path");
const router = express.Router();

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb(new Error("❌ Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)!"));
};

const upload = multer({ storage, fileFilter });

// API tạo bài viết có ảnh
router.post("/", upload.array("image", 5), async (req, res) => {
  try {
    console.log("Files nhận được:", req.files); // 🟢 Kiểm tra danh sách ảnh upload

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "❌ Vui lòng chọn ảnh" });
    }

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    const newPost = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      images: imagePaths, // Lưu danh sách đường dẫn ảnh
    };

    const post = await Post.create(newPost);
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Lấy danh sách bài viết
router.get("/", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Cập nhật bài viết
router.put("/:id", async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(post);
});

// Xóa bài viết
router.delete("/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa bài viết" });
});

module.exports = router;
