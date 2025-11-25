// console.log("🔍 ENV:", import.meta.env);

const API_URL = import.meta.env.VITE_API_URL
// console.log("📌 API_URL:", API_URL);  

// 📌 Session timeout handler
let sessionTimeoutId = null;
let refreshTimeoutId = null;

// 📌 Auto-logout callback (sẽ được set từ AuthProvider)
let onAutoLogout = null;

export const setAutoLogoutCallback = (callback) => {
  onAutoLogout = callback;
};

// 📌 Clear all timers
const clearSessionTimers = () => {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }
};

// 📌 Setup session timers
const setupSessionTimers = (sessionExpiration) => {
  clearSessionTimers();
  
  const now = new Date().getTime();
  const expirationTime = new Date(sessionExpiration).getTime();
  const timeUntilExpiration = expirationTime - now;
  
  if (timeUntilExpiration <= 0) {
    // Session đã hết hạn
    if (onAutoLogout) onAutoLogout();
    return;
  }
  
  // Refresh token sau 1 tiếng 45 phút (15 phút trước khi hết hạn)
  const refreshTime = Math.max(0, timeUntilExpiration - 15 * 60 * 1000);
  if (refreshTime > 0) {
    refreshTimeoutId = setTimeout(async () => {
      console.log("🔄 Tự động refresh token...");
      await refreshToken();
    }, refreshTime);
  }
  
  // Auto-logout khi hết hạn
  sessionTimeoutId = setTimeout(() => {
    console.log("⏰ Session hết hạn - tự động đăng xuất");
    if (onAutoLogout) onAutoLogout();
  }, timeUntilExpiration);
};

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

    // 📌 Lưu tokens và session info
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("sessionExpiration", data.sessionExpiration);
    
    if (data.user) {
      const { id, _id, name, email, avatar } = data.user;
      const userToStore = { id: id || _id, name, email, avatar };
      localStorage.setItem("user", JSON.stringify(userToStore));
    }
    
    // 📌 Setup auto-logout timers
    setupSessionTimers(data.sessionExpiration);
    
    return { success: true, user: data.user, token: data.token };
  } catch (error) {
    return { error: "Tên đăng nhập hoặc mật khẩu không đúng!" };
  }
};

// 📌 Refresh Token
export const refreshToken = async () => {
  try {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    if (!refreshTokenValue) {
      throw new Error("Không có refresh token");
    }

    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || "Không thể refresh token");
    }

    // 📌 Cập nhật token và session mới
    localStorage.setItem("token", data.token);
    localStorage.setItem("sessionExpiration", data.sessionExpiration);
    
    // 📌 Setup lại timers với session mới
    setupSessionTimers(data.sessionExpiration);
    
    console.log("✅ Token đã được refresh thành công");
    return { success: true };
  } catch (err) {
    console.error("❌ Lỗi refresh token:", err);
    // Nếu refresh thất bại, logout
    if (onAutoLogout) onAutoLogout();
    return { error: err.message };
  }
};

export const getUserInfo = async () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token) return null;

  try {
    // Nếu có thông tin user trong localStorage, trả về ngay
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
      // 📌 Nếu token hết hạn, thử refresh
      if (data.isSessionExpired) {
        const refreshResult = await refreshToken();
        if (refreshResult.success) {
          // Thử lại với token mới
          return await getUserInfo();
        }
      }
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("sessionExpiration");
      return null;
    }

    // Lưu thông tin user mới
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("❌ Lỗi lấy thông tin user:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sessionExpiration");
    return null;
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      // Gọi API logout để xóa session trên server
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("❌ Lỗi logout:", error);
  } finally {
    // 📌 Xóa tất cả thông tin local và clear timers
    clearSessionTimers();
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionExpiration");
  }
};

// 📌 Check session on app startup
export const checkSession = () => {
  const sessionExpiration = localStorage.getItem("sessionExpiration");
  if (sessionExpiration) {
    const now = new Date().getTime();
    const expirationTime = new Date(sessionExpiration).getTime();
    
    if (now >= expirationTime) {
      // Session đã hết hạn
      if (onAutoLogout) onAutoLogout();
      return false;
    }
    
    // Setup timers cho session hiện tại
    setupSessionTimers(sessionExpiration);
    return true;
  }
  return false;
};

export const register = async (name, email, password, confirmPassword) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Đăng ký thất bại. Hãy kiểm tra lại thông tin!" };
    }

    // 📌 Lưu tokens và session info
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("sessionExpiration", data.sessionExpiration);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    // 📌 Setup auto-logout timers
    setupSessionTimers(data.sessionExpiration);
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    return { error: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau!" };
  }
};



