import { useState, useEffect } from "react";
import PostForm from "../main/CreatePost/PostForm";
import PostList from "../main/CreatePost/PostList";
import Story from "../main/Story";
function Main() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/comments")
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.log(err));
  }, []);

  const handleUpload = async (formData) => {
    try {
      const token = localStorage.getItem("token"); // 🔹 Lấy token từ localStorage
      if (!token) {
        console.log("❌ Không có token, hãy đăng nhập lại!");
        return;
      }

      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Gửi token kèm theo
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi không xác định");
      }

      const newPost = await res.json();
      setPosts([newPost, ...posts]);
    } catch (err) {
      console.log("❌ Lỗi upload:", err.message);
    }
  };

  const handleDelete = async (postId) => {
    console.log("🛠 postId nhận được:", postId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ Không có token, hãy đăng nhập lại!");
        return;
      }

      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi không xác định");
      }

      console.log("✅ Xóa bài viết thành công");

      // Cập nhật danh sách bài viết (lọc bỏ bài viết vừa xóa)
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("❌ Lỗi xóa bài viết:", err.message);
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ Không có token, hãy đăng nhập lại!");
        return;
      }

      const res = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, text }),
      });

      if (!res.ok) {
        throw new Error("Lỗi khi thêm bình luận");
      }

      const newComment = await res.json();
      setComments([...comments, newComment]); // Cập nhật state
    } catch (err) {
      console.log("❌ Lỗi thêm bình luận:", err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ Không có token, hãy đăng nhập lại!");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi không xác định");
      }

      console.log("✅ Xóa bình luận thành công");
      setComments((prev) => prev.filter((c) => c._id !== commentId)); // Cập nhật UI
    } catch (err) {
      console.error("❌ Lỗi xóa bình luận:", err.message);
    }
  };

  return (
    <div className="lg:w-[45%]">
      <PostForm onUpload={handleUpload} />
      <Story />
      <PostList
        onDeleteComment={handleDeleteComment}
        onAddComment={handleAddComment}
        onDelete={handleDelete}
        posts={posts}
        comments={comments}
      />
    </div>
  );
}

export default Main;
