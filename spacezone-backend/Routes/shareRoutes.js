const express = require("express");
const Share = require("../models/Share");
const router = express.Router();

// Chia sẻ bài viết
router.post("/", async (req, res) => {
  const share = await Share.create(req.body);
  res.status(201).json(share);
});

module.exports = router;
