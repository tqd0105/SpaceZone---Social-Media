const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        console.log("Headers nhận được:", req.headers);

        const authHeader = req.header("Authorization");
        if (!authHeader) {
            console.log("❌ Không tìm thấy header Authorization!");
            return res.status(401).json({ error: "Bạn chưa đăng nhập!" });
        }

        const token = authHeader.replace("Bearer ", "").trim();
        if (!token) {
            console.log("❌ Token trống!");
            return res.status(401).json({ error: "Token không hợp lệ!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ User từ token:", decoded);

        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Lỗi xác thực token:", error.message);
        res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};
