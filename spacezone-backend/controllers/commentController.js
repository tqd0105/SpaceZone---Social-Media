const Comment = require("../models/Comment");

// 📌 API lấy tất cả bình luận của một bài post (bao gồm phản hồi)
const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId, parentId: null })
      .populate({
        path: "replies",
        populate: { path: "replies" }, // Lấy phản hồi của phản hồi
      })
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(comments);
  } catch (error) {
    console.error("Lỗi khi lấy bình luận:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 📌 API lấy toàn bộ bình luận (bao gồm thông tin bài post)
const getComment = async (req, res) => {
  try {
    const comments = await Comment.find().populate("postId");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server khi lấy bình luận" });
    console.log(error);
  }
};

// 📌 API thêm bình luận hoặc phản hồi
const addComment = async (req, res) => {
  try {
    const { postId, userId, text, parentId } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Nội dung không được để trống!" });
    }

    const newComment = new Comment({ postId, userId, text, parentId });
    await newComment.save();

    res.status(201).json({ ...newComment.toObject(), postId }); // Đảm bảo trả về postId
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};


// 📌 API xóa bình luận
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận!" });
    }

    res.status(200).json({ message: "Xóa bình luận thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa bình luận:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { getCommentsByPostId, addComment, getComment, deleteComment };
