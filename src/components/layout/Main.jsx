import { useState, useEffect } from "react";
import PostForm from "../main/CreatePost/PostForm";
import PostList from "../main/CreatePost/PostList";
import Story from "../main/Story";
import Refresh from "../../assets/icons/main/CreatePost/refresh.png";
const API_URL = import.meta.env.VITE_API_URL

function Main() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null); 
  const [isShowNewPostNoti, setIsShowNewPostNoti] = useState(false); 

  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/comments`)
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

      const res = await fetch(`${API_URL}/posts`, {
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
    setLoading(true);
    setDeletingPostId(postId);

    try {
      const token = localStorage.getItem("token");
      console.log("🛠 Token:", token); // Log token
      if (!token) {
        console.log("❌ Không có token, hãy đăng nhập lại!");
        return;
      }

      console.log("🛠 Gọi API xóa:", `${API_URL}/posts/${postId}`); // Log API URL
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("🛠 Phản hồi từ API:", res); // Log phản hồi

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Dữ liệu lỗi từ API:", errorData); // Log dữ liệu lỗi
        throw new Error(errorData.error || "Lỗi không xác định");
      }

      console.log("✅ Xóa bài viết thành công");

      if (posts && Array.isArray(posts)) {
        setPosts(posts.filter((post) => post._id !== postId));
      } else {
        console.log("❌ Danh sách bài viết không hợp lệ!");
      }
    } catch (err) {
      console.error("❌ Lỗi xóa bài viết:", err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleAddComment = async (postId, text) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ Không có token, hãy đăng nhập lại!");
        return;
      }
  
      const res = await fetch(`${API_URL}/comments`, {
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
  
      // Cập nhật bình luận mới vào state và lưu lại vào localStorage
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      localStorage.setItem(`comments_${postId}`, JSON.stringify(updatedComments)); // Lưu vào localStorage
      console.log("✅ Thêm bình luận thành công");
  
    } catch (err) {
      console.log("❌ Lỗi thêm bình luận:", err.message);
    }
  };

  useEffect(() => {
    const fetchAllComments = async () => {
      try {
        const commentPromises = posts.map((post) =>
          fetch(`${API_URL}/comments/${post._id}`).then((res) => {
            if (!res.ok) throw new Error("Lỗi khi lấy bình luận");
            return res.json();
          })
        );
  
        const allCommentsArrays = await Promise.all(commentPromises);
        const allComments = allCommentsArrays.flat(); // Gộp thành 1 mảng duy nhất
  
        setComments(allComments); // Cập nhật 1 lần
      } catch (err) {
        console.error("❌ Lỗi khi fetch bình luận:", err.message);
      }
    };
  
    if (posts.length > 0) fetchAllComments();
  }, [posts]);
  

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ Không có token, hãy đăng nhập lại!");
        return;
      }

      const res = await fetch(
        `${API_URL}/comments/${commentId}`,
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
    <div className="lg:w-[45%] m_pb-80px">

        {isShowNewPostNoti && (
        <div className="fixed flex-row-center gap-2 top-24 left-1/2 cursor-pointer -translate-x-1/2  z-50 bg-gray-900 text-white p-4 rounded-lg shadow-2xl hover:bg-gray-700 animate__animated animate__fadeIn animate_slow" onClick={()=>window.location.reload()}>
          <img src={Refresh} width={20} height={20} alt="Refresh" className="animate__animated animate__rubberBand animate_slow animate__infinite" />
          <span className="font-bold">Đã có cập nhật mới!</span>
        </div>

         )}
        <PostForm
          onUpload={handleUpload}
          setIsShowNewPostNoti={setIsShowNewPostNoti}
        />
      <Story />
      <PostList
      posts={posts}
      comments={comments}
        onDeleteComment={handleDeleteComment}
        onAddComment={handleAddComment}
        onDelete={handleDelete}
        
        loading={loading}
        deletingPostId={deletingPostId}
        setComments={setComments}
      />
    </div>
  );
}

export default Main;
