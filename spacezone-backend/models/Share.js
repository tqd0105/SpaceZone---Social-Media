const mongoose = require("mongoose");

const ShareSchema = new mongoose.Schema(
  {
    userId: String,
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Share", ShareSchema);
