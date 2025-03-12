import posts from "../models/postModel.js";

// Lấy danh sách tất cả bài post
export const getPosts = (req, res) => {
  res.json(posts);
};

// Lấy bài post theo ID
export const getPostById = (req, res) => {
  const { id } = req.params;
  const post = posts.find((p) => p.id == id);
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ message: "Post not found" });
  }
};

// Thêm bài post mới
export const createPost = (req, res) => {
  const { name, caption, image } = req.body;
  const newPost = { id: posts.length + 1, name, caption, image };
  posts.push(newPost);
  res.status(201).json(newPost);
};

// Cập nhật bài post
export const updatePost = (req, res) => {
  const { id } = req.params;
  const { name, caption, image } = req.body;
  const postIndex = posts.findIndex((post) => post.id == id);

  if (postIndex !== -1) {
    posts[postIndex] = { id: Number(id), name, caption, image };
    res.json(posts[postIndex]);
  } else {
    res.status(404).json({ message: "Post not found" });
  }
};

// Xóa bài post
export const deletePost = (req, res) => {
  const { id } = req.params;
  const index = posts.findIndex((post) => post.id == id);
  if (index !== -1) {
    posts.splice(index, 1);
    res.json({ message: "Post deleted successfully" });
  } else {
    res.status(404).json({ message: "Post not found" });
  }
};
