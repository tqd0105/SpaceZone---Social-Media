const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// 📌 Kiểm tra API hoạt động
router.get("/", (req, res) => {
  res.send("✅ Auth API is working!");
});

router.get("/register", (req, res) => {
  res.send("✅ API /auth/register đang hoạt động (chỉ hỗ trợ POST)");
});


// 📌 Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Mật khẩu xác nhận không khớp!" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email đã được sử dụng!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username: email.split("@")[0]
    });

    await newUser.save();

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});




// 📌 Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// 📌 Lấy thông tin user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy user" });
    }
    res.json(user);
  } catch (error) {
    console.error("❌ Lỗi lấy thông tin user:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
