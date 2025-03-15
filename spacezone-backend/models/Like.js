const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
  {
    userId: String,
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Like", LikeSchema);
