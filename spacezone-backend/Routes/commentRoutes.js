const express = require("express");
const router = express.Router();
const { getCommentsByPostId, addComment, getComment, deleteComment } = require("../controllers/commentController");

router.get("/:postId", getCommentsByPostId); // Lấy bình luận
router.post("/", addComment); // Thêm bình luận
router.get("/", getComment)
router.delete("/:commentId", deleteComment)

module.exports = router;
