import { HashRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";


import Header from "./components/layout/Header";
import Leftbar from "./components/layout/LeftBar";
import RightBar from "./components/layout/RightBar";
import Main from "./components/layout/Main";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import PostForm from "./components/main/CreatePost/PostForm";
import Profile from "./components/main/Profile";

function App() {
  const {user} = useAuth();
  return (
    <AuthProvider>
      <Router >
        <Routes>
          {/* 🟢 Layout dành cho người chưa đăng nhập */}
          <Route element={<LoginLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* 🟢 Layout dành cho người đã đăng nhập */}
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Main />} />
              <Route path="/post" element={<PostForm />} />
              <Route path="/:username" element={<Profile />} />
            </Route>
          </Route>

          {/* 🟢 Mặc định chuyển hướng về /login nếu chưa đăng nhập */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

/* ✅ Bảo vệ route: Nếu chưa đăng nhập → chuyển về /login */
const RequireAuth = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="p-2 font-bold">Loading...</p>
    </div>
  );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

/* ✅ Layout chính khi đã đăng nhập */
const MainLayout = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Header />
      <div className="flex justify-between w-full pt-[75px]">
        <Leftbar user={user}/>
        <Outlet /> {/* 🟢 Outlet để render nội dung */}
        <RightBar />
      </div>
    </div>
  );
};

/* ✅ Layout khi chưa đăng nhập */
const LoginLayout = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Outlet /> {/* 🟢 Outlet để render Login / Register */}
    </div>
  );
};

export default App;
