const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    image: String, // Lưu link ảnh bài đăng
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
