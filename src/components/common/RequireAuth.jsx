import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const RequireAuth = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="text-center mt-10">Loading...</div>; // 🟡 Hiện Loading trong khi kiểm tra

  if (!user) return <Navigate to="/login" replace />; // 🔴 Chưa đăng nhập → Chuyển về login

  return <Outlet />; // 🟢 Đã đăng nhập → Hiển thị nội dung
};

export default RequireAuth;
