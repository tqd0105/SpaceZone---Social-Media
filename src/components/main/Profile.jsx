import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
const defaultCover =
  "https://spacezone-backend-qy5g.onrender.com/uploads/cover/default_cover.png";
const defaultAvatar =
  "https://spacezone-backend-qy5g.onrender.com/uploads/avatar/default.png";
import {
  BackBlack,
  CalendarBlack,
  Close,
  Edit,
  Location2,
  School,
  Setting,
  Tick,
  Work,
} from "../../assets/icons/main/main";
import EditProfile from "./EditProfile";
import { useAuth } from "../../context/AuthProvider";
import ImageDetail from "../common/ImageDetail";
import UserTabSwitcher from "./UserTabSwitcher";

const API_URL = "https://spacezone-backend-qy5g.onrender.com/api";

function Profile() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isOpenEditProfile, setIsOpenEditProfile] = useState(false);
  const [isShowImageDetail, setIsShowImageDetail] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${username}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser({});
      }
    };
    fetchUser();
  }, [username]);

  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.log(err));
  }, []);

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file || !user?._id) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    const fieldName = type === "avatar" ? "avatar" : "cover";
    formData.append(fieldName, file);

    try {
      const res = await fetch(
        `${API_URL}/users/${user._id}/${
          type === "avatar" ? "avatar" : "cover"
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const updated = await res.json();
      setUser(updated);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDelete = async (type) => {
    if (!user?._id) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/users/${user._id}/${type}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updated = await res.json();
      setUser(updated);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleUpdateUser = async (updatedData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedData.user, // chú ý updatedData.user nếu response dạng {user, token}
    }));

    // Cập nhật localStorage nếu có token mới
    if (updatedData.token && updatedData.user) {
      localStorage.setItem("token", updatedData.token);
      localStorage.setItem("user", JSON.stringify(updatedData.user));
      // Nếu dùng context AuthProvider, gọi hàm cập nhật context ở đây
      // Ví dụ: authContext.setUser(updatedData.user);
    }

    if (updatedData.user?.username && updatedData.user.username !== username) {
      navigate(`/${updatedData.user.username}`, { replace: true });
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.log(err));
  }, []);

  const handleAddComment = async (postId, text) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ Không có token, hãy đăng nhập lại!");
        return;
      }

      const res = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, text }),
      });

      if (!res.ok) {
        throw new Error("Lỗi khi thêm bình luận");
      }

      const newComment = await res.json();
      setComments([...comments, newComment]); // Cập nhật state
    } catch (err) {
      console.log("❌ Lỗi thêm bình luận:", err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ Không có token, hãy đăng nhập lại!");
        return;
      }

      const res = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi không xác định");
      }

      console.log("✅ Xóa bình luận thành công");
      setComments((prev) => prev.filter((c) => c._id !== commentId)); // Cập nhật UI
    } catch (err) {
      console.error("❌ Lỗi xóa bình luận:", err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    console.log("🛠 postId nhận được:", postId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ Không có token, hãy đăng nhập lại!");
        return;
      }

      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi không xác định");
      }

      console.log("✅ Xóa bài viết thành công");

      // Cập nhật danh sách bài viết (lọc bỏ bài viết vừa xóa)
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("❌ Lỗi xóa bài viết:", err.message);
    }
  };

  //   const fullCoverURL = useMemo(()=>{
  //     return user?.coverImage ? `${API_URL}${user.coverImage}` : defaultCoverURL;
  //   }, [user])

  return (
    <div className="lg:w-[45%] m_pb-80px">
      <div className="flex-row-start gap-4 my-2 ">
        <div
          className="rounded-full hover:bg-gray-300 hover:transform p-2 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <img src={BackBlack} width={20} height={20} alt="" />
        </div>
        <div className="flex-column-start">
          <span className="font-bold text-lg ">{user?.name}</span>
          <p className=" text-gray-500">Trang cá nhân</p>
        </div>
      </div>
      <div className="relative ">
        <img
          src={user?.coverImage ? `${API_URL}${user.coverImage}` : defaultCover}
          className=" object-cover cursor-pointer w-full h-[250px] "
          alt=""
          onClick={() => setIsShowImageDetail("cover")}
        />
        <div className="flex-row-end">
          <div
            className="absolute left-4 bottom-0 m_bottom-5 transform cursor-pointer  "
            onClick={() => setIsShowImageDetail("avatar")}
          >
            <img
              src={user?.avatar ? `${API_URL}${user.avatar}` : defaultAvatar}
              alt=""
              className="rounded-full border-4  border-white w-[160px] h-[160px] m_w-h-120px object-cover"
            />
          </div>
          {isShowImageDetail && (
            <ImageDetail
              user={user}
              isAvatar={isShowImageDetail === "avatar"}
              onClose={() => setIsShowImageDetail(false)}
            />
          )}
          <div className="flex-column-center gap-2 m-2">
            <div className="flex-row-center gap-2">
              <button
                className="hover:bg-gray-200 border-2 border-gray-600"
                onClick={() => setIsOpenEditProfile(!isOpenEditProfile)}
              >
                Chỉnh sửa trang cá nhân
              </button>

              {isOpenEditProfile && (
                <EditProfile
                  isOpenEditProfile={isOpenEditProfile}
                  setIsOpenEditProfile={setIsOpenEditProfile}
                  user={user}
                  handleUpload={handleUpload}
                  handleDelete={handleDelete}
                  handleUpdateUser={handleUpdateUser}
                />
              )}

              <button className="hover:bg-gray-200 border-2 border-gray-600 m_hidden">
                Kho lưu trữ tin
              </button>
              <img
                src={Setting}
                width={20}
                height={20}
                alt=""
                className="cursor-pointer"
              />
            </div>
            <div className="flex-row-center gap-4">
              <p>
                <span className="font-bold">2.5k</span> người theo dõi
              </p>
              <p>
                <span className="font-bold">3.1k</span> đang theo dõi
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="m_m-2">
        <div className="flex-row-start gap-2 ">
          <h3 className="font-extrabold text-2xl">{user?.name}</h3>
          <div className="flex-row-center gap-2 bg-gray-200 rounded-full px-3 py-1">
            <img src={Tick} width={20} height={20} alt="" />
            <span>Đã xác minh</span>
          </div>
        </div>
        <span className="flex-row-start text-gray-400">@{user?.username}</span>
        <p className="flex-row-start font-medium my-2">Tiểu sử</p>
        <div className="flex-row-between m_flex-col  gap-2 ">
          <div className="flex-column-start gap-1 w-3/5 m_w-full">
            <div className="flex-row-start gap-2">
              <img src={Work} width={20} height={20} alt="" />
              <p>
                <span className="italic">Kỹ sư phần mềm</span> tại
                <span className="font-bold"> Viettel Telecom</span>
              </p>
            </div>
            <div className="flex-row-start gap-2">
              <img src={School} width={20} height={20} alt="" />
              <p className="text-left">
                Học <span className="italic">Công nghệ thông tin</span> tại{" "}
                <span className="font-bold">
                  Trường Đại học Giao Thông Vận Tải Thành Phố Hồ Chí Minh
                </span>
              </p>
            </div>
          </div>
          <div className="flex-column-start gap-1 w-1/2 m_w-full">
            <div className="flex-row-start gap-2">
              <img src={Location2} width={20} height={20} alt="" />
              <p className="text-left">
                Sống tại{" "}
                <span className="font-bold">Thành phố Hồ Chí Minh</span>
              </p>
            </div>
            <div className="flex-row-start gap-2">
              <img src={CalendarBlack} width={20} height={20} alt="" />
              <span className="text-left">Tham gia vào tháng 9 năm 2019</span>
            </div>
          </div>
        </div>
      </div>

      <UserTabSwitcher
        posts={posts}
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onDelete={handleDeletePost}
        user={user}
      />
    </div>
  );
}

export default Profile;
