import { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import styled from "./Account.module.scss";
import SuccessIcon from "../assets/icons/main/Account/check.png";
import { Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "", // Thêm name vào state
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [countdown, setCountDown] = useState(3);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const res = await register(name, email, password, confirmPassword);
      console.log("📌 Kết quả đăng ký:", res);

      if (res.error) {
        setError(res.error);
      } else {
        setModal(true);
        let countDownValue = 3;
        const timer = setInterval(() => {
          countDownValue -= 1;
          setCountDown(countDownValue);

          if (countDownValue <= 0) {
            clearInterval(timer);
            setModal(false);
            navigate("/login");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Lỗi đăng ký:", error);
      setError("Lỗi đăng ký, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex-column-start rounded-lg bg-gray-100 mc_login  m_w-90pc ${styled.animation_backInUp}`}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white py-6 rounded-lg shadow-md lg:w-96"
      >
        <h2 className="text-2xl font-bold text-center text-black ">
          Tạo tài khoản mới
        </h2>
        {error && (
          <p className="text-red-500 text-center font-semibold">{error}</p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Họ và Tên"
          value={formData.name}
          onChange={handleChange}
          className={`w-[90%] p-2 mt-4 border rounded-md m_w-90pc text-black  ${styled.input_transition}`}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={`w-[90%] p-2 mt-4 border rounded-md m_w-90pc text-black  ${styled.input_transition}`}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          className={`w-[90%] p-2 mt-4 border rounded-md m_w-90pc text-black  ${styled.input_transition}`}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Xác nhận mật khẩu"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-[90%] p-2 mt-4 border rounded-md  m_w-90pc text-black  ${styled.input_transition}`}
          required
        />

        <div className="flex justify-center items-center">
          <button
            type="submit"
            className={`w-[90%] lg:flex-row-center gap-2 p-2 mt-4 bg-blue-500  rounded-md m_w-90pc ${styled.gradient2}`}
            style={{ color: "white" }}
          >
            {loading ? (
              <div className="flex-row-center gap-2 ">
                <div className={`${styled.loading__spinner}`}></div>
                <span >Đang thiết lập tài khoản</span>
              </div>
            ) : (
              <span>Đăng kí</span>
            )}
          </button>
        </div>

        <div className="w-1/2 translate-x-1/2 h-[1px] bg-gray-200 my-3"></div>

        <div>
          <p className="font-semibold text-blue-500 ">
            Bạn đã có tài khoản rồi!
          </p>
          <Link to="/login">
            <button
              className={`w-1/2 hover:bg-blue-700  font-semibold py-2 px-4 mt-2 rounded-md outline-none  ${styled.gradient}`}
              style={{ color: "white" }}
            >
              Đăng nhập
            </button>
          </Link>
        </div>
      </form>

      {/* Modal ở đây */}
      {modal && (
        <div
          className={`animation-bounce bg-white p-4 rounded-lg shadow-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${styled.animation_fadeIn}`}
        >
          <div className="flex-column-center">
            <img src={SuccessIcon} width={50} height={50} alt="" />
            <span className="font-bold text-lg text-green-600">Thành công</span>
          </div>
          <div>
            <p>Bạn đã đăng ký thành công!</p>
            <div className="w-full h-[1px] bg-gray-300 my-2"></div>
            <p className="text-gray-400 text-xs">
              Chuyển hướng đến trang đăng nhập sau {countdown} giây.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
