// console.log("🔍 ENV:", import.meta.env);

const API_URL = import.meta.env.VITE_API_URL
// console.log("📌 API_URL:", API_URL);  

export const login = async (email, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || data.message || "Đăng nhập thất bại");
    }

    // Lưu token và chỉ các trường user cần thiết
    sessionStorage.setItem("token", data.token);
    if (data.user) {
      // Chỉ lấy các trường cần thiết, ví dụ: id, name, email, avatar
      const { id, _id, name, email, avatar } = data.user;
      const userToStore = { id: id || _id, name, email, avatar };
      sessionStorage.setItem("user", JSON.stringify(userToStore));
    }
    return { success: true, user: data.user, token: data.token };
  } catch (error) {
    // Bỏ console.error để giảm log không cần thiết
    return { error: "Tên đăng nhập hoặc mật khẩu không đúng!" };
  }
};

export const getUserInfo = async () => {
  const token = sessionStorage.getItem("token");
  const userStr = sessionStorage.getItem("user");

  if (!token) return null;

  try {
    // Nếu có thông tin user trong sessionStorage, trả về ngay
    if (userStr) {
      return JSON.parse(userStr);
    }

    // Nếu không có, gọi API để lấy thông tin
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      return null;
    }

    // Lưu thông tin user mới
    sessionStorage.setItem("user", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("❌ Lỗi lấy thông tin user:", error);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return null;
  }
};

export const logout = async () => {
  await logoutService();
  setUser(null);  // ❌ Lỗi, vì setUser chỉ có trong `AuthProvider`
  navigate("/login", { replace: true });
};

export const register = async (name, email, password, confirmPassword) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }), // ✅ Gửi confirmPassword
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Đăng ký thất bại. Hãy kiểm tra lại thông tin!" };
    }

    // ✅ Lưu token và thông tin user sau khi đăng ký thành công
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    return { success: true, user: data.user };
  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    return { error: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau!" };
  }
};



