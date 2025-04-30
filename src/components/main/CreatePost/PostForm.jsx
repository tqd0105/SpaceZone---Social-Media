import { useEffect, useState } from "react";
import { Avatar, createPostItems } from "@/assets/icons/main/main.js";
import { Icon } from "../../common/UIElement";
import Button from "../../common/Button";
import { Close, Photo } from "../../../assets/icons/main/main";
const defaultAvatar = "https://spacezone-backend-qy5g.onrender.com/uploads/avatar/default.png";
import { useAuth } from "../../../context/AuthProvider"; // ✅ Sử dụng hook useAuth
import { Link } from "react-router-dom";
import styled from "../../../pages/Account.module.scss";

const API_URL = "https://spacezone-backend-qy5g.onrender.com/api";

function PostForm({ onUpload }) {
  const { user } = useAuth(); // ✅ Lấy user từ useAuth()
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fullAvatarURL = user?.avatar
    ? `${API_URL}${user.avatar}`
    : defaultAvatar;

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
    setLoading(true);
    if (!user) {
      setError("Bạn cần đăng nhập để đăng bài!");
      return;
    }

    if (!content.trim() && !image) {
      alert("Nội dung hoặc hình ảnh không được để trống!");
    }

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
    setLoading(false);
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
      <div className="bg-white my-3 p-4 rounded-lg shadow-md border border-gray-300 m_m-2" >
        <div className="md:flex md:flex-col gap-4 w-full">
          <div className="md:flex items-start gap-2 w-full m_flex-row">
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

          <div className="md:flex justify-between items-center w-full m_flex-row">
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
                <div
                  key={index}
                  className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer m_hidden"
                >
                  <img src={item} width="25" height="25" alt="icon" />
                </div>
              ))}
              {createPostItems.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer l_hidden"
                >
                  <img src={item} width="25" height="25" alt="icon" />
                </div>
              ))}
            </div>
            <div>
              {loading ? (
                <div className="flex justify-center items-center  ">
                  <div
                    type="submit"
                    color="white"
                    className="flex items-center m_flex-row gap-2 px-6 py-2 bg-black rounded-full text-white cursor-not-allowed hover:bg-gray-700"
                    disabled={!content.trim() && !image}
                  >
                    <div className={`${styled.loading__spinner} `}></div>
                    <span>Đang tạo...</span>
                  </div>
                </div>
              ) : (
                <Button
                  type="submit"
                  children="Đăng"
                  color="white"
                  backgroundColor="black"
                  className="px-4 py-2 rounded hover:bg-gray-700"
                  disabled={!content.trim() && !image}
                />
              )}
            </div>
          </div>
          {error && <p className="text-red-500 font-bold">{error}</p>}
        </div>
      </div>
    </form>
  );
}

export default PostForm;
