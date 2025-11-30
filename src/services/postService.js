const API_URL = import.meta.env.VITE_API_URL

// ✅ Gửi bài viết lên server
export const createPost = async (formData) => {
  const token = localStorage.getItem("token");
  console.log("Token gửi đi:", token); // 🛠 Debug xem token có đúng không

  // if (!token) throw new Error("❌ Bạn chưa đăng nhập!");

  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "❌ Không thể tạo bài viết");

  return data;
};

// ✅ Lấy danh sách bài viết (chỉ của bạn bè)
export const getPosts = async () => {
  const token = localStorage.getItem("token");
  
  if (!token) throw new Error("❌ Bạn chưa đăng nhập!");

  const res = await fetch(`${API_URL}/posts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "❌ Không thể tải bài viết");

  return data;
};

// ✅ Xóa bài viết
export const deletePost = async (postId) => {
  const token = localStorage.getItem("token");
  
  if (!token) throw new Error("❌ Bạn chưa đăng nhập!");

  const res = await fetch(`${API_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "❌ Không thể xóa bài viết");
  }

  return true;
};

