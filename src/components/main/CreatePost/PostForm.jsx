import { useEffect, useState } from "react";
import { Avatar, createPostItems } from "@/assets/icons/main/main.js";
import { Icon } from "../../common/UIElement";
import Button from "../../common/Button";
import { Close, Photo } from "../../../assets/icons/main/main";
import defaultAvatar from "https://spacezone-backend.up.railway.app/uploads/avatar/default.png";
import { useAuth } from "../../../context/AuthProvider"; // ✅ Sử dụng hook useAuth
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function PostForm({ onUpload }) {
  const { user } = useAuth(); // ✅ Lấy user từ useAuth()
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const fullAvatarURL = user?.avatar ? `${API_URL}${user.avatar}` : defaultAvatar;

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (content || image) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [content, image]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Bạn cần đăng nhập để đăng bài!");
      return;
    }

    if (!content.trim() && !image) {
      alert("Nội dung hoặc hình ảnh không được để trống!");
    };

    const formData = new FormData();
    formData.append("content", content.trim() || "");
    if (image) {
      formData.append("image", image);
    }

    console.log("📤 Dữ liệu gửi lên:", [...formData.entries()]);
    await onUpload(formData);

    setContent("");
    setImage(null);
    setPreview(null);
  };

  // 🔴 Nếu chưa đăng nhập, yêu cầu đăng nhập
  if (!user) {
    return (
      <div className="bg-white my-4 p-4 rounded-lg shadow-md text-center">
        <p className="text-red-500 font-bold">Bạn cần đăng nhập để đăng bài!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white my-3 p-4 rounded-lg shadow-md border border-gray-300">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-start gap-2 w-full">
            <Link to={`/${user.username}`} className="flex-shrink-0">
            <img
              src={fullAvatarURL}
              
              alt="avatar"
              className="rounded-full w-[50px] h-[50px] object-cover"
            />
            </Link>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Hôm nay của bạn có ổn không?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full outline-none bg-gray-200 hover:bg-gray-300 p-3 rounded-full"
              />
            </div>
          </div>

          {preview && (
            <div className="flex-row-center">
              <div className="relative">
                <img
                  src={preview}
                  alt="preview"
                  width={400}
                  height={200}
                  className="border-2 shadow-2xl rounded-lg"
                />
                <Icon
                  src={Close}
                  width={20}
                  height={20}
                  onClick={() => {
                    setPreview(null);
                    setImage(null);
                  }}
                  className="absolute top-2 right-2 cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center w-full">
            <div className="flex-row-center gap-1">
              <label htmlFor="fileUpload">
                <div className="cursor-pointer hover:bg-gray-200 p-2 rounded-lg">
                  <img src={Photo} alt="upload" width={25} height={25} />
                </div>
              </label>
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={handleImageChange}
              />
              {createPostItems.map((item, index) => (
                <div key={index} className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer">
                  <img src={item} width="25" height="25" alt="icon" />
                </div>
              ))}
            </div>
            <Button
              type="submit"
              children="Đăng"
              color="white"
              backgroundColor="black"
              className="hover:bg-gray-300"
              disabled={!content.trim() && !image}
            />
          </div>
          {error && <p className="text-red-500 font-bold">{error}</p>}
        </div>
      </div>
    </form>
  );
}

export default PostForm;
