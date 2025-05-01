import {
  Close,
  CloseBlack,
  Delete,
  Edit,
  User,
} from "../../assets/icons/main/main";
const defaultCover = `${import.meta.env.VITE_API_URL}/uploads/cover/default_cover.png`;
const defaultAvatar = `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`;
import ToggleSwitch from "../common/ToggleSwitch";
import PrivacySelector from "./PrivacySelector";
import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL

function EditProfile({
  isOpenEditProfile,
  setIsOpenEditProfile,
  user,
  handleUpload,
  handleDelete,
  handleUpdateUser
}) {
  const [isShowOptionsAvatar, setIsShowOptionsAvatar] = useState(false);
  const [tempUser, setTempUser] = useState({
    name: user?.name || "",
    username: user?.username || "",
    coverImage: user?.coverImage || "",
    avatar: user?.avatar || "",
  });

  const [tempFiles, setTempFiles] = useState({
    cover: null,
    avatar: null,
  });

  const [deletedItems, setDeletedItems] = useState({
    avatar: false,
    cover: false
  });

  const handleTempDelete = (type) => {
    setDeletedItems(prev => ({
      ...prev,
      [type]: true
    }));
    
    setTempFiles(prev => ({
      ...prev,
      [type]: null
    }));
  
    // Set default image when deleting
    setTempUser(prev => ({
      ...prev,
      [type === "avatar" ? "avatar" : "coverImage"]: 
        type === "avatar" ? `/uploads/avatar/default.png` : `/uploads/cover/default_cover.png`
    }));
  };

  const handleTempUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setTempFiles((prev) => ({
      ...prev,
      [type]: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempUser((prev) => ({
        ...prev,
        [type === "avatar" ? "avatar" : "coverImage"]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      // Handle name and username update first
      if (tempUser.name !== user.name || tempUser.username !== user.username) {
        console.log('Sending update with data:', {
          name: tempUser.name,
          username: tempUser.username
        });
  
        const userUpdateResponse = await fetch(`${API_URL}/users/${user._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: tempUser.name,
            username: tempUser.username,
          }),
        });
  
        // Log the raw response
        console.log('Response status:', userUpdateResponse.status);
        const responseText = await userUpdateResponse.text();
        console.log('Raw response:', responseText);
  
        if (!userUpdateResponse.ok) {
          throw new Error(`Failed to update user information: ${responseText}`);
        }
  
        // Parse the response if it's JSON
        let updatedUserData;
        try {
          updatedUserData = JSON.parse(responseText);
          console.log(updatedUserData);
          
        } catch (e) {
          throw new Error('Invalid JSON response from server');
        }
  
        console.log("Updated user data:", updatedUserData);
        
        // Update the parent component
        handleUpdateUser(updatedUserData);
      }
  
      // Handle remaining operations
      await Promise.all([
        ...Object.entries(tempFiles).map(async ([type, file]) => {
          if (file) {
            const formData = new FormData();
            formData.append(type, file);
            const response = await fetch(`${API_URL}/users/${user._id}/${type}`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: formData,
            });
            if (!response.ok) {
              throw new Error(`Failed to upload ${type}`);
            }
          }
        }),
        ...Object.entries(deletedItems).map(async ([type, isDeleted]) => {
          if (isDeleted) {
            const response = await fetch(`${API_URL}/users/${user._id}/${type}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            if (!response.ok) {
              throw new Error(`Failed to delete ${type}`);
            }
          }
        })
      ]);
  
      // Close the modal
      setIsOpenEditProfile(false);
      window.location.reload();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(`Failed to save changes: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 flex-row-center z-50 animate__animated animate__fadeIn">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setIsOpenEditProfile(null)}
      ></div>
      <div className="relative top-0 left-0 w-[600px] max-h-[80vh] overflow-auto bg-white rounded-lg shadow-2xl">
        <div className="flex-row-between m-3">
          <div className="flex-row-center gap-1">
            <img src={User} width={20} height={20} alt="" />
            <span className="font-extrabold text-lg">
              Chỉnh sửa trang cá nhân
            </span>
          </div>
          <img
            src={CloseBlack}
            width={20}
            height={20}
            onClick={() => setIsOpenEditProfile(null)}
            alt=""
            className="cursor-pointer"
          />
        </div>
        <div className="relative ">
          <img
            src={
              deletedItems.cover ? defaultCover :
              (tempFiles.cover ? tempUser.coverImage :
              (user?.coverImage ? `${API_URL}${user.coverImage}` : defaultCover))
            }
            className=" object-cover w-full h-[200px]"
            alt=""
          />
          <div className="flex-row-center gap-2 absolute bottom-3 right-3 shadow-2xl">
            <div className=" cursor-pointer shadow-2xl bg-white px-2 py-1 rounded-md hover:bg-opacity-80">
              <div>
                <label
                  htmlFor="cover_edit"
                  className="cursor-pointer flex-row-center gap-1 "
                >
                  <img src={Edit} width={25} height={25} alt="" />
                  <span className="font-bold">Chỉnh sửa</span>
                </label>
                <input
                  type="file"
                  id="cover_edit"
                  className="hidden"
                  onChange={(e) => handleTempUpload(e, "cover")}
                />
              </div>
            </div>
            <div
              className="flex-row-center gap-1 cursor-pointer shadow-2xl bg-white px-2 py-1 rounded-md hover:bg-opacity-80"
              onClick={() => handleTempDelete("cover")}
            >
              <img src={Delete} width={25} height={25} alt="" />
              <span className="font-bold">Xoá </span>
            </div>
          </div>
          <div
            className="absolute left-4 -bottom-16"
            onMouseEnter={() => setIsShowOptionsAvatar(true)}
            onMouseLeave={() => setIsShowOptionsAvatar(false)}
          >
            <img
              src={
                deletedItems.avatar ? defaultAvatar :
              (tempFiles.avatar ? tempUser.avatar :
              (user?.avatar ? `${API_URL}${user.avatar}` : defaultAvatar))
              }
              alt=""
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
              className="rounded-full border-4  border-white w-[150px] h-[150px] object-cover"
            />

            {isShowOptionsAvatar && (
              <div className="flex-row-center absolute inset-0 animate__animated animate__fadeIn">
                <div className=" shadow-2xl border-[5px] border-transparent hover:border-white hover:rounded-full">
                  <label htmlFor="avatar_edit" className="cursor-pointer">
                    <img src={Edit} width={25} height={30} alt="" />
                  </label>
                  <input
                    type="file"
                    id="avatar_edit"
                    className="hidden"
                    onChange={(e) => handleTempUpload(e, "avatar")}
                  />
                </div>
                <div
                  onClick={() => handleTempDelete("avatar")}
                  className="shadow-2xl cursor-pointer border-[5px] border-transparent hover:border-white hover:rounded-full"
                >
                  <img src={Delete} width={25} height={20} alt="" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-[70px]"></div>

        <div className="flex flex-col gap-1 ">
          <div className="flex-column-start gap-2 mx-4 my-2">
            <label htmlFor="name" className="font-bold">
              Họ và tên
            </label>
            <input
              type="text"
              id="name"
              className=" w-full rounded-lg px-4 py-2 border-[1px] border-gray-400"
              value={tempUser.name}
              onChange={(e) =>
                setTempUser((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="flex-column-start gap-2 mx-4 my-2">
            <label htmlFor="name" className="font-bold">
              Tên người dùng
            </label>
            <input
              type="text"
              id="name"
              className=" w-full rounded-lg px-4 py-2 border-[1px] border-gray-400"
              value={tempUser.username}
              onChange={(e) =>
                setTempUser((prev) => ({ ...prev, username: e.target.value }))
              }
            />
          </div>
          <div className="flex-column-start gap-2 mx-4 my-2 ">
            <h4 className="font-bold"> Truy cập danh bạ</h4>
            <div className="flex-row-between border-[1px] border-gray-400 px-4 py-2 rounded-lg">
              <div className="flex-column-start ">
                <h4 className="font-bold"> Cho phép truy cập danh bạ</h4>
                <p className="text-gray-400 text-left max-w-[500px]">
                  Khi bật tính năng này, hệ thống sẽ truy cập danh bạ và cho
                  phép người khác tìm thấy bạn qua danh bạ của họ.
                </p>
              </div>
              <ToggleSwitch />
            </div>
          </div>

          <div className="flex-column-start gap-2 mx-4 my-2 ">
            <h4 className="font-bold"> Đối tượng</h4>
            <div className="flex-row-between gap-2 border-[1px] border-gray-400 px-4 py-2 rounded-lg">
              <div className="flex-column-start ">
                <h4 className="font-bold"> Chỉnh sửa đối tượng xem</h4>
                <p className="text-gray-400 text-left max-w-[400px]">
                  Khi bật tính năng này, bạn sẽ chỉnh sửa đối tượng mặc định có
                  thể xem nội dung của bạn bất cứ khi nào bạn đăng bài.
                </p>
              </div>
              <PrivacySelector />
            </div>
          </div>

          <div className="flex-column-start gap-2 mx-4 my-2 ">
            <h4 className="font-bold"> Chế độ chuyên nghiệp</h4>
            <div className="flex-row-between border-[1px] border-gray-400 px-4 py-2 rounded-lg">
              <div className="flex-column-start ">
                <h4 className="font-bold"> Bật chế độ chuyên nghiệp</h4>
                <p className="text-gray-400 text-left max-w-[500px]">
                  Khi bật tính năng này, bạn có thể quản lý lượt tương tác và
                  kiếm tiền từ nội dung ở trang cá nhân của bạn.
                </p>
              </div>
              <ToggleSwitch />
            </div>
          </div>
        </div>

        <div className="flex-row-center sticky bottom-0 py-3 mt-3 border-t-[1px] border-gray-200 bg-white gap-2">
          <button
            className="bg-blue-500 text-white px-4 rounded-md w-[80px]"
            onClick={handleSave}
          >
            Lưu
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-200"
            onClick={() => setIsOpenEditProfile(null)}
          >
            Huỷ
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
