const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    image: String, // Lưu link ảnh bài đăng
    author: String, // ID user
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
