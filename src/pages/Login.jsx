import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login as loginService } from "../services/authService";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import styled from "./Account.module.scss";
import User from '../assets/icons/main/Account/user.png';
import User2 from '../assets/icons/main/Account/user2.png';
import Close from '../assets/icons/main/Account/close.png';
import Next from '../assets/icons/main/Account/next.png';


const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Danh sách tài khoản demo (avatar có thể cập nhật từ backend)
const DEMO_ACCOUNTS = [
  {
    name: "Dũng Trần",
    email: "tranquangdung.tech@gmail.com",
    password: "1",
    avatar: "/uploads/avatar/tranquangdung.tech@gmail.com.png"
  },
  {
    name: "Dong Chen",
    email: "tqd0105@gmail.com",
    password: "1",
    avatar: "/uploads/avatar/tqd0105@gmail.com.png"
  },
  {
    name: "Nguyen Truong Lam",
    email: "ntl@gmail.com",
    password: "1",
    avatar: "/uploads/avatar/ntl@gmail.com.png"
  },
  {
    name: "DUNG QUANG",
    email: "dtq287@gmail.com",
    password: "1",
    avatar: "/uploads/avatar/dtq287@gmail.com.png"
  },
];

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { login: loginContext } = useAuth();
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm chọn tài khoản demo
  const handleSelectDemoAccount = (account) => {
    setFormData({
      email: account.email,
      password: account.password,
    });
    setShowDemoAccounts(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginService(formData.email, formData.password);
      if (res.error) {
        setError(res.error);
      } else {
        // 📌 Cập nhật để hỗ trợ session timeout
        loginContext(res.user, res.token, res.refreshToken, res.sessionExpiration);
        navigate("/home", { replace: true });
      }
    } catch (error) {
      setError("Lỗi đăng nhập, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };




  return (
    <div
      className={`flex-column-center bg-white h-fit px-8 py-6 my-4  rounded-xl shadow-xl mc_login  ${styled.animation_backInUp}`}
    >
      <h2 className="font-bold text-2xl mb-4 text-black">Đăng nhập tài khoản</h2>

      

      <form onSubmit={handleLogin} className="ms_w-full min-w-[320px]">
        <div className="flex-column-center gap-2 ">
          {/* Email Input */}
          <div className={`  ${styled.input_container} ms_w-full w-full`} >
            <div className="text-left mb-2">
              <label className="font-semibold text-black ">Tên đăng nhập</label>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Vui lòng nhập tên đăng nhập"
              className={`${styled.input_transition} w-full text-black `}
              required
            />
          </div>

          {/* Password Input */}
          <div className={`  ${styled.input_container} ms_w-full w-full `} >
            <div className="text-left mb-2">
              <label className="font-semibold text-black  ">Mật khẩu</label>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Vui lòng nhập mật khẩu của bạn"
              className={`${styled.input_transition} w-full text-black `}
              required
            />
          </div>

          {error && (
            <p className="text-left text-red-500 font-semibold">{error}</p>
          )}
        </div>
        <button
          type="submit"
          className={`hover:bg-blue-700 text-white font-semibold py-2 px-4 mt-3 rounded-md outline-none w-full ${styled.gradient}`}
        >
          {loading ? (
            <div className="flex-row-center gap-2">
              <div className={`${styled.loading__spinner}`}></div>
              <span>Đang xử lí thông tin</span>
            </div>
          ) : (
            <span style={{ color: "white" }}>Đăng nhập</span>
          )}
        </button>

        <div className="w-full h-[1px] bg-gray-300 my-4"></div>

        <div>
          <p className="font-bold text-red-600">
            Nếu bạn chưa có tài khoản!!!
          </p>
          <Link to="/register">
            <button
              className={`w-1/2 p-2 mt-2 bg-blue-500  rounded-md ${styled.gradient2} `}
              style={{ color: "white" }}
            >
              Tạo tài khoản mới
            </button>
          </Link>
        </div>

        
      </form>

        <div className="w-full h-[1px] bg-gray-100 my-2"></div>

      {/* Demo Accounts Button */}
      <h2 className="text-black font-bold mb-1">Hoặc sử dụng tài khoản demo</h2>
      <button
        type="button"
        onClick={() => setShowDemoAccounts(true)}
        className=" flex items-center justify-center gap-2 py-2 px-4 shadow-lg bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 font-semibold text-sm"
      >
        <img src={User2} width={25} alt="User Icon" />
        <span>Tài khoản Demo</span>
      </button>

      {/* Demo Accounts Modal */}
      {showDemoAccounts && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDemoAccounts(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gray-900 px-8 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-xl flex items-center gap-2">
                <img src={User} width={40} alt="User Icon" /> Chọn tài khoản Demo
              </h3>
              <button
                type="button"
                onClick={() => setShowDemoAccounts(false)}
                className="p-1"
              >
                <img src={Close} width={30} alt="Close Icon" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <p className="text-gray-500 text-sm mb-4 text-center">
                Chọn một tài khoản để tự động điền thông tin đăng nhập
              </p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((account, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectDemoAccount(account)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-3 border border-gray-100 hover:border-blue-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {account.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-800">{account.name}</p>
                      <p className="text-xs text-gray-400">{account.email}</p>
                    </div>
                    <span className="flex flex-col items-center justify-center  text-blue-600 text-sm font-bold">Chọn <img src={Next} width={25} alt="Next Icon" /></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
