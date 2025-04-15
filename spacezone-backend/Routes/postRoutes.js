const express = require("express");
const multer = require("multer");
const Post = require("../models/Post");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const mongoose = require('mongoose');
const authMiddleware = require("../middlewares/authMiddleware");

// 📌 Cấu hình Multer (Lưu trữ file)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/post";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb(new Error("❌ Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)!"));
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

// ✅ API: Tạo bài viết (CHỈ CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("User từ token:", req.user); // 🛠 Debug xem user có đúng không

    if (!req.body.content && !req.file) {
      return res.status(400).json({ error: "❌ Nội dung hoặc ảnh không được để trống" });
    }

    const newPost = new Post({
      title: req.body.title || "Không có tiêu đề",
      content: req.body.content || "",
      author: req.user.id, // 🛠 Nếu `req.user` là `undefined`, lỗi do token không hợp lệ
      image: req.file ? `/uploads/post/${req.file.filename}` : null,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("❌ Lỗi tạo bài viết:", error);
    res.status(500).json({ error: "❌ Lỗi server" });
  }
});


// ✅ API: Lấy danh sách bài viết
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find() 
      .populate("author", "name username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách bài viết:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ✅ API: Lấy bài viết theo ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name username avatar");
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });
    res.json(post);
  } catch (error) {
    console.error("❌ Lỗi lấy bài viết:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ✅ API: Cập nhật bài viết (CHỈ CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });
    
    // Kiểm tra quyền sửa bài viết
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền sửa bài viết này" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { ...req.body, author: req.user.id },
      { new: true }
    );
    
    res.json(updatedPost);
  } catch (error) {
    console.error("❌ Lỗi cập nhật bài viết:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ✅ API: Xóa bài viết (CHỈ CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Kiểm tra ID có hợp lệ không
    if (!postId || postId === "undefined") {
      return res.status(400).json({ error: "❌ ID không hợp lệ" });
    }

    // Kiểm tra xem ID có đúng định dạng MongoDB ObjectId không
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "❌ ID không đúng định dạng" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "❌ Bài viết không tồn tại" });

    // Kiểm tra quyền xóa bài viết
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bài viết này" });
    }

    // Xóa file ảnh nếu có
    if (post.image) {
      const imagePath = path.join(__dirname, "..", post.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("❌ Lỗi xóa file ảnh:", err);
      });
    }

    await Post.findByIdAndDelete(postId);
    res.json({ message: "✅ Đã xóa bài viết thành công" });
  } catch (error) {
    console.error("❌ Lỗi xóa bài viết:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// 📌 Xuất module
module.exports = router;
