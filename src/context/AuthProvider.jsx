import { createContext, useContext, useState, useEffect } from "react";
import { logout as logoutService, checkSession, setAutoLogoutCallback } from "../services/authService";
import { useNavigate } from "react-router-dom";
import SessionExpiredModal from "../components/common/SessionExpiredModal";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiration, setSessionExpiration] = useState(null);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  
  // 📌 Auto-logout function
  const handleAutoLogout = async () => {
    console.log("🚪 Tự động đăng xuất do hết session");
    await logoutService();
    setUser(null);
    setSessionExpiration(null);
    
    // Hiển thị modal thay vì alert
    setShowSessionExpiredModal(true);
  };

  // 📌 Handle session expired modal confirm
  const handleSessionExpiredConfirm = () => {
    setShowSessionExpiredModal(false);
    // Redirect to login
    window.location.href = "/login";
  };

  // 🧪 Test function for SessionExpiredModal (development only)
  const testSessionExpiredModal = () => {
    setShowSessionExpiredModal(true);
  };
  
  useEffect(() => {
    // 📌 Set callback cho authService
    setAutoLogoutCallback(handleAutoLogout);
    
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const storedSessionExpiration = localStorage.getItem("sessionExpiration");
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setSessionExpiration(storedSessionExpiration);
      
      // 📌 Kiểm tra session còn hạn không
      const isSessionValid = checkSession();
      if (!isSessionValid) {
        handleAutoLogout();
        setIsLoading(false);
        return;
      }
    }
    
    // 📌 Lắng nghe event userUpdated để cập nhật user context
    const handleUserUpdated = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      }
    };
    
    window.addEventListener('userUpdated', handleUserUpdated);
    
    setIsLoading(false);
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdated);
    };
  }, []);
  
  const login = (userData, token, refreshToken, expiration) => {
    setUser(userData);
    setSessionExpiration(expiration);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (expiration) localStorage.setItem("sessionExpiration", expiration);
  };
  
  const logout = async () => {
    await logoutService();
    setUser(null);
    setSessionExpiration(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      setUser,
      sessionExpiration,
      handleAutoLogout,
      testSessionExpiredModal // 🧪 For testing only
    }}>
      {children}
      
      {/* Session Expired Modal */}
      <SessionExpiredModal 
        // isOpen={showSessionExpiredModal}
        // onConfirm={handleSessionExpiredConfirm}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
