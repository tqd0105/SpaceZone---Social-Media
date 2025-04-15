const express = require("express"); /* Tao API nhanh chong */
const mongoose = require("mongoose"); /* Lam viec voi MongoDB */
const multer = require("multer"); /* Xu li tai file upload */
const User = require("../models/User"); /* Lam viec voi collection posts - tuong tu voi table sql */
const path = require("path"); /* Lam viec voi duong dan file */
const fs = require("fs"); /* Thao tac voi file he thong - file system */
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require("../middlewares/authMiddleware");
const { error } = require("console");
const uploadsAvatarDir = path.join(__dirname, "../uploads/avatar");
const uploadsCoverDir = path.join(__dirname, "../uploads/cover");

if (!fs.existsSync(uploadsAvatarDir)) {
  fs.mkdirSync(uploadsAvatarDir, { recursive: true });
}
if (!fs.existsSync(uploadsCoverDir)) {
  fs.mkdirSync(uploadsCoverDir, { recursive: true });
}

// Cau hinh multer
const storage = multer.diskStorage({
  /*  Req: doi tuong yeu cau - form, header/ id de lay chinh xac hinh anh
        file: thong tin file - file.originalName: ten file goc
        cb: callback(error, duong_dan) - tra ve duong dan file hoac bao loi
    */
  destination: (req, file, cb) => {
    cb(null, "uploads/avatar");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const coverStorage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, "uploads/cover");
    },
     filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
     },
})


// Bo loc kiem tra file
const fileFilter = (req, file, cb) => {
  console.log("File nhan duoc: ", file);

  const allowedTypes = /jpeg|jpg|png|gif|svg/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb(new Error("Chi chap nhan file anh (jpg, jpeg, png, gif)"));
};

// Cau hinh multer
const upload = multer({ storage, fileFilter });
const uploadCover = multer({ storage: coverStorage, fileFilter})

// Get User
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Loi server" });
  }
});

// Backend Express (userRoutes.js hoặc tương tự)
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error getting user by username:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/:id
router.put('/:id', verifyToken, async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Nếu username thay đổi → tạo lại token
    const token = jwt.sign(
      { id: updatedUser._id, username: updatedUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ user: updatedUser, token });
  } catch (error) {
    console.error("Lỗi khi cập nhật user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});


// Thay bằng cập nhật user
router.put("/:id/avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: `/uploads/avatar/${req.file.filename}` },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error("Lỗi cập nhật avatar:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});


// Update Cover Image
router.put("/:id/cover", verifyToken, uploadCover.single("cover"), async (req, res)=>{
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {coverImage: `/uploads/cover/${req.file.filename}`},
            { new: true }
        );
        res.json(updatedUser);
    }
    catch (error) {
        console.error("Loi cap nhat cover: ", error);
        res.status(500).json({ error: "Loi server" });
    }
})

router.delete("/:id/:type", async (req, res)=> {
  const { id, type } = req.params;

  if (!["avatar","cover"].includes(type)) {
    return res.status(400).json({error: "Type khong hop le"});
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const fieldMap = {
      avatar: "avatar",
      cover: "coverImage",
    }
    const field = fieldMap[type];
    const imagePath = user[field];
    if (imagePath) {
      const relativePath = imagePath.replace(`/uploads/${type}/`,'')
      const fullPath = path.join(__dirname, `../uploads/${type}`, relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      user[field] = ""
      await user.save();
    }
    res.json(user);
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ error: "Lỗi server" });
  }
})

// Delete User
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || userId === "undefined") {
      return res.status(400).json({ error: "ID khong hop le" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "ID khong dung dinh dang" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user)
      return res.status(404).json({ error: "Nguoi dung khong ton tai" });

    res.json({ message: "Da xoa nguoi dung thanh cong" });
  } catch {
    console.error("Loi xoa nguoi dung: ", error);
    res.status(500).json({ error: "Loi server" });
  }
});

module.exports = router;
