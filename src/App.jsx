import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";


import Header from "./components/layout/Header";
import Leftbar from "./components/layout/LeftBar";
import RightBar from "./components/layout/RightBar";
import Main from "./components/layout/Main.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Friends from "./pages/FriendsSimple";
import Watch from "./pages/Watch";
import Groups from "./pages/Groups";
import Gaming from "./pages/Gaming";
import "./App.css";
import "./styles/dark-mode.scss";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import { DarkModeProvider } from "./context/DarkModeContext.jsx";
import ChatProvider from "./context/ChatProvider.jsx";
import { CallProvider } from "./context/CallContext.jsx";
import CallManager from "./components/call/CallManager.jsx";
import PostForm from "./components/main/CreatePost/PostForm";
import Profile from "./components/main/Profile";
// import RightBarPage from "./components/main/RightBarPage";

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <ChatProvider>
          <CallProvider>
            <AppRoutes />
          </CallProvider>
        </ChatProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const basename = process.env.NODE_ENV === 'production' ? '/SpaceZone---Social-Media' : '';
  
  return (
    <Router basename={basename}>
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
            <Route path="/friends" element={<Friends />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/gaming" element={<Gaming />} />
            <Route path="/post" element={<PostForm />} />
            <Route path="/:username" element={<Profile />} />
          </Route>
        </Route>

        {/* 🟢 Mặc định chuyển hướng về /login nếu chưa đăng nhập */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
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
    <div className="min-h-screen bg-white ">
      <Header />
      <div className="flex justify-between w-full pt-[75px]">
        <Leftbar user={user}/>
        <Outlet /> {/* 🟢 Outlet để render nội dung */}
        <RightBar />
      </div>
      {/* Call Manager - Global call interface */}
      <CallManager />
    </div>
  );
};

/* ✅ Layout khi chưa đăng nhập */
const LoginLayout = () => {
  const { user, isLoading } = useAuth();

  // Nếu đã đăng nhập thì redirect về home
  if (!isLoading && user) {
    return <Navigate to="/home" replace />;
  }

  // Nếu đang loading thì hiển thị loading
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="p-2 font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100"
    style={{backgroundImage: "linear-gradient(to right, #ec77ab 0%, #0906ffd1 100%)"}}>
      <Outlet /> {/* 🟢 Outlet để render Login / Register */}
    </div>
  );
};

export default App;
