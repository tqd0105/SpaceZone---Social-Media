const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 📌 Đăng ký người dùng
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "Email đã được sử dụng" });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Đăng ký thành công!", user });
  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    res.status(500).json({ error: "Lỗi server, vui lòng thử lại!" });
  }
};

// 📌 Đăng nhập người dùng
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email hoặc mật khẩu không đúng" });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Email hoặc mật khẩu không đúng" });

    // Tạo token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Đăng nhập thành công!", token, user });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
    res.status(500).json({ error: "Lỗi server, vui lòng thử lại!" });
  }
};

// 📌 Lấy thông tin người dùng
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "Người dùng không tồn tại" });

    res.json(user);
  } catch (error) {
    console.error("❌ Lỗi lấy thông tin user:", error);
    res.status(500).json({ error: "Lỗi server, vui lòng thử lại!" });
  }
};
