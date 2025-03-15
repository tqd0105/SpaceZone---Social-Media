const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    userId: String, // ID user
    text: String,
    image: String, // Lưu link ảnh nếu bình luận có ảnh
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
