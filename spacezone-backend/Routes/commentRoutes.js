const express = require("express");
const Comment = require("../models/Comment");
const router = express.Router();

// Đăng bình luận
router.post("/", async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Lấy bình luận của bài viết
router.get("/:postId", async (req, res) => {
  const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: 1 });
  res.json(comments);
});

// Sửa bình luận
router.put("/:id", async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(comment);
});

// Xóa bình luận
router.delete("/:id", async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa bình luận" });
});

module.exports = router;
