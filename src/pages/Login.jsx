import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import styled from "./Account.module.scss";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginContext } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await login(formData.email, formData.password);
      if (res.error) {
        setError(res.error);
      } else {
        loginContext(res.user);
        console.log("✅ Đăng nhập thành công:", res.user);
        
        // 🔥 CHỈ CHUYỂN ĐẾN "/home", KHÔNG PHẢI "/"
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
      setError("Lỗi đăng nhập, vui lòng thử lại!");
    }
  };
  
  return (
    <div className={`flex-column-start bg-white h-fit px-8 py-6 my-4 rounded-xl shadow-xl ${styled.animation_backInUp}`}>
      <h2 className="font-semibold text-xl mb-4">Đăng nhập tài khoản</h2>
      <form onSubmit={handleLogin}>
        <div className="flex-column-center gap-2">
          {/* Email Input */}
          <div className={styled.input_container}>
            <div className="text-left mb-2">
              <label className='font-semibold'>Tên đăng nhập</label>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Vui lòng nhập tên đăng nhập"
              className={styled.input_transition}
              required
            />
          </div>

          {/* Password Input */}
          <div className={styled.input_container}>
            <div className="text-left mb-2">
              <label className='font-semibold'>Mật khẩu</label>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Vui lòng nhập mật khẩu của bạn"
              className={styled.input_transition}
              required
            />
          </div>

          {error && (<p className="text-left text-red-500 font-semibold">{error}</p>)}
        </div>
        <button 
          type="submit" 
          className={`hover:bg-blue-700 text-white font-semibold py-2 px-4 mt-3 rounded-md outline-none w-full ${styled.gradient}`}
        >
          Đăng nhập
        </button>

        <div className="w-full h-[1px] bg-gray-300 my-4"></div>

        <div>
          <p className="font-semibold text-gray-400">Nếu bạn chưa có tài khoản</p>
        <Link to="/register" >
              <button className={`w-1/2 p-2 mt-2 bg-blue-500 text-white rounded-md ${styled.gradient2}`}>Tạo tài khoản mới</button>
        </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
