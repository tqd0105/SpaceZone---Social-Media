const express = require("express");
const Like = require("../models/Like");
const router = express.Router();

// Like bài viết
router.post("/", async (req, res) => {
  const like = await Like.create(req.body);
  res.status(201).json(like);
});

// Unlike bài viết
router.delete("/:id", async (req, res) => {
  await Like.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã bỏ thích" });
});

module.exports = router;
