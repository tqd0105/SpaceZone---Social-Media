# 🚀 Space Zone — Social Media Platform

<p align="center">
  <strong>Mạng xã hội hiện đại được xây dựng với React, Node.js, MongoDB và Socket.IO</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socketdotio&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker" />
</p>

---

## 📖 Giới thiệu

**Space Zone** là một nền tảng mạng xã hội full-stack, nơi người dùng có thể kết nối, chia sẻ và giao tiếp với nhau trong thời gian thực. Dự án được xây dựng với kiến trúc client-server tách biệt, giao tiếp qua REST API và WebSocket.

## ✨ Tính năng chính

### 👤 Tài khoản & Hồ sơ
- Đăng ký / Đăng nhập với xác thực JWT
- Trang cá nhân (Profile) với avatar và ảnh bìa
- Chỉnh sửa thông tin cá nhân

### 📝 Bài viết (Posts)
- Tạo bài viết với hình ảnh
- Bình luận bài viết
- Thả reaction (Like, Love, Haha, Wow, Sad, Angry) với animation Lottie
- Chia sẻ bài viết

### 💬 Nhắn tin thời gian thực (Chat)
- Nhắn tin 1-1 qua WebSocket (Socket.IO)
- Danh sách cuộc hội thoại
- Gửi tin nhắn văn bản
- Chia sẻ bài viết qua tin nhắn

### 📞 Gọi điện (Call)
- Gọi thoại / video giữa các người dùng
- Giao diện cuộc gọi đến / đi
- Quản lý cuộc gọi toàn cục (CallManager)

### 👥 Bạn bè (Friends)
- Tìm kiếm người dùng
- Gửi / nhận / chấp nhận lời mời kết bạn
- Danh sách bạn bè

### 🌗 Giao diện
- Dark Mode / Light Mode
- Responsive design
- Giao diện hiện đại với TailwindCSS + MUI + SCSS Modules

### 📰 Các trang
- **Home** — News Feed chính
- **Friends** — Quản lý bạn bè & lời mời
- **Watch** — Xem video
- **Groups** — Nhóm
- **Gaming** — Gaming

---

## 🏗️ Kiến trúc dự án

```
Space-Zone/
├── space-zone/              # 🖥️ Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # UI Components
│   │   │   ├── call/        #   Gọi điện
│   │   │   ├── chat/        #   Nhắn tin
│   │   │   ├── friends/     #   Bạn bè
│   │   │   ├── layout/      #   Header, Sidebar, Main layout
│   │   │   ├── main/        #   Post, Comment, Profile, Story
│   │   │   └── user/        #   User components
│   │   ├── context/         # React Context (Auth, Chat, Call, DarkMode)
│   │   ├── hooks/           # Custom hooks (useCall, useChat, ...)
│   │   ├── pages/           # Route pages (Home, Login, Friends, ...)
│   │   ├── services/        # API service layer (Axios)
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
│
└── spacezone-backend/       # ⚙️ Backend (Node.js + Express)
    ├── controllers/         # Business logic
    ├── models/              # Mongoose schemas
    │   ├── User.js
    │   ├── Post.js
    │   ├── Comment.js
    │   ├── Message.js
    │   ├── Conversation.js
    │   ├── Friend.js
    │   ├── Like.js
    │   └── Share.js
    ├── Routes/              # API endpoints
    ├── socket/              # Socket.IO handlers (chat, call)
    ├── middlewares/          # Auth middleware, file upload
    ├── config/              # Database & env config
    ├── uploads/             # User uploaded files
    ├── Dockerfile           # Docker image
    └── docker-compose.yml   # Docker Compose (app + MongoDB)
```

---

## 🛠️ Tech Stack

| Layer        | Công nghệ                                                    |
| ------------ | ------------------------------------------------------------- |
| **Frontend** | React 19, Vite 6, TailwindCSS 3, MUI 6, SCSS Modules        |
| **Backend**  | Node.js, Express 4, Socket.IO 4                              |
| **Database** | MongoDB (Mongoose 8)                                         |
| **Auth**     | JWT (jsonwebtoken), bcryptjs                                  |
| **Realtime** | Socket.IO (chat & call)                                      |
| **Upload**   | Multer                                                        |
| **Animation**| Lottie (lottie-react, lottie-web)                             |
| **Deploy**   | Docker, GitHub Pages (frontend), Render-ready (backend)       |

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- **Node.js** >= 18
- **MongoDB** (local hoặc MongoDB Atlas)
- **npm** hoặc **yarn**

### 1. Clone repository

```bash
git clone https://github.com/tqd0105/SpaceZone---Social-Media.git
cd SpaceZone---Social-Media
```

### 2. Cài đặt Backend

```bash
cd spacezone-backend
npm install
```

Tạo file `.env`:

```env
MONGO_URI=mongodb://localhost:27017/spacezone
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Chạy backend:

```bash
npm start
```

### 3. Cài đặt Frontend

```bash
cd space-zone
npm install
```

Chạy frontend:

```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`, Backend tại `http://localhost:5000`.

### 4. Chạy với Docker (tuỳ chọn)

```bash
cd spacezone-backend
docker-compose up --build
```

---

## 📡 API Endpoints

| Method   | Endpoint             | Mô tả                        |
| -------- | -------------------- | ----------------------------- |
| `POST`   | `/api/auth/register` | Đăng ký tài khoản             |
| `POST`   | `/api/auth/login`    | Đăng nhập                     |
| `GET`    | `/api/users`         | Lấy thông tin người dùng      |
| `GET`    | `/api/posts`         | Lấy danh sách bài viết        |
| `POST`   | `/api/posts`         | Tạo bài viết mới              |
| `POST`   | `/api/comments`      | Bình luận bài viết             |
| `POST`   | `/api/likes`         | Thả reaction                  |
| `POST`   | `/api/shares`        | Chia sẻ bài viết              |
| `GET`    | `/api/chat`          | Lấy cuộc hội thoại            |
| `GET`    | `/api/friends`       | Quản lý bạn bè                |

---

## 🔌 WebSocket Events

| Event                | Hướng          | Mô tả                          |
| -------------------- | -------------- | ------------------------------- |
| `sendMessage`        | Client → Server | Gửi tin nhắn                   |
| `receiveMessage`     | Server → Client | Nhận tin nhắn mới              |
| `callUser`           | Client → Server | Bắt đầu cuộc gọi              |
| `incomingCall`       | Server → Client | Thông báo cuộc gọi đến        |

---

## 📂 Scripts

### Frontend (`space-zone/`)

| Script          | Lệnh                | Mô tả                       |
| --------------- | -------------------- | ---------------------------- |
| `npm run dev`   | `vite`               | Chạy dev server              |
| `npm run build` | `vite build`         | Build production             |
| `npm run lint`  | `eslint .`           | Kiểm tra code style          |
| `npm run deploy`| `gh-pages -d dist`   | Deploy lên GitHub Pages      |

### Backend (`spacezone-backend/`)

| Script          | Lệnh                | Mô tả                       |
| --------------- | -------------------- | ---------------------------- |
| `npm start`     | `node server.js`     | Chạy server                  |

---

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/ten-tinh-nang`)
3. Commit thay đổi (`git commit -m "Add: tính năng mới"`)
4. Push lên branch (`git push origin feature/ten-tinh-nang`)
5. Tạo Pull Request

---

## 📄 License

ISC License

---

<p align="center">
  Made with ❤️ by <strong>Space Zone Team</strong>
</p>
