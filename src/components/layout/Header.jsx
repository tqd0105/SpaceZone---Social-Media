import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import Logo from "../common/Logo";
import ControlBar from "../common/ControlBar";
import { Icon } from "../common/UIElement";
import { useAuth } from "../../context/AuthProvider";

import {
  HomeIcon,
  FriendIcon,
  WatchIcon,
  GroupIcon,
  GameIcon,
  MenuIcon,
  ChatIcon,
  NotiIcon,
  RightArrow,
  Setting,
  Logout,
  Help,
  Close,
  History,
  Image,
  Upload,
} from "@/assets/icons/header/header.js";

import styles from "./Header.module.scss";
import defaultAvatar from "../../../spacezone-backend/uploads/avatar/default.png";
import { BackArrow } from "../../assets/icons/header/header";
import { Back, CloseBlack } from "../../assets/icons/main/main";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Header() {
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [postResult, setPostResult] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileRedirect, setIsProfileRedirect] = useState(false);
  const [activeControlCenter, setActiveControlCenter] = useState(0);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const postCache = useRef([]);
  const historyRef = useRef(null);
  const postRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      const isClickInsideSearch =
        searchRef.current && searchRef.current.contains(event.target);
      const isClickInsideHistory =
        historyRef.current && historyRef.current.contains(event.target);
      const isClickInsidePost =
        postRef.current && postRef.current.contains(event.target);

      if (!isClickInsideSearch && !isClickInsideHistory && !isClickInsidePost) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đóng menu khi thoát ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Load lịch sử tìm kiếm từ localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    try {
      if (postCache.current.length === 0) {
        const response = await fetch(`${API_URL}/api/posts`);
        console.log(response);

        if (!response.ok) {
          throw new Error("Không thể tìm kiếm bài viết");
        }

        const posts = await response.json();
        postCache.current = posts;
      }

      const filteredPosts = postCache.current.filter(
        (post) =>
          post.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          post.content.toLowerCase().includes(searchValue.toLowerCase()) ||
          post.author?.name?.toLowerCase().includes(searchValue.toLowerCase())
      );

      // Lưu lịch sử tìm kiếm, tránh trùng lặp
      const newHistory = [...new Set([searchValue, ...history])];
      setHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));

      setPostResult(filteredPosts);
      setShowHistory(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setSearchValue(item);
    handleSearch(new Event("submit")); // Gọi lại tìm kiếm
  };

  // Xóa một mục khỏi lịch sử tìm kiếm
  const handleDeleteItem = (item) => {
    const newHistory = history.filter((h) => h !== item);
    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  // Xóa toàn bộ lịch sử tìm kiếm
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const fullAvatarURL = useMemo(() => {
    return user?.avatar ? `${API_URL}${user.avatar}` : defaultAvatar;
  }, [user]);

  const controlCenterIcons = [
    { icon: HomeIcon, link: "/home" },
    { icon: FriendIcon, link: "/home" },
    { icon: WatchIcon, link: "/home" },
    { icon: GroupIcon, link: "/home" },
    { icon: GameIcon, link: "/home" },
  ];

  const controlRightIcons = [
    { icon: MenuIcon, link: "/home" },
    { icon: ChatIcon, link: "/home" },
    { icon: NotiIcon, link: "/home" },
  ];

  return (
    <div className="flex-row-between  bg-white px-4 py-0 fixed top-0 w-full z-50 shadow-md">
      {/* Logo + Tìm kiếm */}
      <div className="relative flex items-center gap-2 xl:w-[25%]" >
      <Link to="/home" className="flex items-center gap-2" onClick={closeSearch}>
        <Logo width="50" height="50" />
        </Link>
        <SearchBar
          placeholder="Tìm kiếm trên SpaceZone"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onClick={toggleSearch}
          onSubmit={handleSearch}
          ref={searchRef}
        />

        {/* Kết quả tìm kiếm */}
        {isSearchOpen && (
          <div
            className={`absolute top-full left-0 w-full bg-white py-2 px-4 rounded-b-xl shadow-2xl z-10  ${
              isSearchOpen ? styles.search_open : styles.search_open
            } ${styles.hidden_scrollbar} max-h-[510px] overflow-y-scroll`}
            ref={historyRef}
          >
            {showHistory ? (
              <>
                <div className="flex-row-between gap-2  py-2 cursor-pointer">
                  <div className="flex-row-center gap-2">
                    <img
                      src={Back}
                      width={20}
                      height={15}
                      onClick={closeSearch}
                      alt=""
                    />
                    <h3 className="font-bold flex justify-between">
                      Lịch sử tìm kiếm
                    </h3>
                  </div>
                  <span
                    onClick={handleClearHistory}
                    className="text-blue-500 cursor-pointer hover:text-blue-400"
                  >
                    Xóa tất cả
                  </span>
                </div>
                {history.length === 0 ? (
                  <p className="text-center text-gray-400 py-2">
                    Chưa có lịch sử tìm kiếm
                  </p>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-2 hover:bg-gray-200 rounded-xl cursor-pointer "
                      // onClick={() => handleSelectHistoryItem(item)}
                    >
                      <div className="flex-row-center gap-2">
                        <div className="p-2 bg-gray-200 rounded-full">
                          <img src={History} alt="" width={20} height={20} />
                        </div>
                        <span
                          onClick={() => setSearchValue(item)}
                          className={`${styles.narrow_text} text-left`}
                        >
                          {item}
                        </span>
                      </div>
                      <div
                        onClick={() => handleDeleteItem(item)}
                        className="flex-row-center"
                      >
                        <img src={Close} alt="" width={10} height={10} />
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <div ref={postRef}>
                <div
                  className="flex-row-between gap-2 px-2 py-1 cursor-pointer"
                  onClick={() => setShowHistory(true)}
                >
                  <img src={BackArrow} width={20} height={20} alt="" />
                  <h3 className="font-semibold">Kết quả tìm kiếm</h3>
                </div>
                {postResult.length === 0 ? (
                  <p className="text-center text-gray-400 py-2">
                    Không tìm thấy bài đăng nào
                  </p>
                ) : (
                  postResult.map((post) => {
                    const fullImageURL = post.image
                      ? `${API_URL}${post.image}`
                      : Image;
                    return (
                      <Link
                        key={post._id}
                        to={`/posts/${post._id}`}
                        className="block p-2 hover:bg-gray-100 flex-row-between gap-2 rounded-xl cursor-pointer"
                      >
                        <div className="flex-row-start gap-2 ">
                          <img
                            src={fullImageURL}
                            alt=""
                            className="w-12 h-12 min-w-[48px] min-h-[48px] object-cover rounded-lg"
                          />

                          <div className="flex flex-col items-start gap-1 ">
                            <p
                              className={`font-semibold text-black text-left ${styles.text_limitLine} `}
                            >
                              {post.content || "Không có tiêu đề"}
                            </p>
                            <p className="text-sm text-gray-500">
                              <span className="font-bold text-blue-600">Tác giả: </span>{" "}
                              {post.author?.name}
                            </p>
                          </div>
                        </div>
                        <div className="w-1/4">
                          <p className="text-green-600">Tag</p>
                          <span className="text-gray-400">#Posts</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thanh điều hướng trung tâm */}
      <ControlBar
        icons={controlCenterIcons}
        className="flex-row-between gap-2 xl:w-[40%]"
        classNames="py-4 px-10 my-1 rounded-lg hover:bg-gray-200 cursor-pointer "
        active={activeControlCenter}
        onClickControlCenter={setActiveControlCenter}
      />

      {/* Thanh điều hướng phải */}
      <div className="flex-row-end gap-4 relative xl:w-[25%]">
        <ControlBar
          icons={controlRightIcons}
          size="25"
          className="flex-row-center gap-2 "
          classNames={`rounded-full p-2 hover:bg-gray-200 cursor-pointer ${styles.bgElement}`}
        />

        {user && (
          <div
            className="relative transform transition-all duration-300 ease-in-out"
            ref={menuRef}
          >
            {/* Avatar */}
            <Icon
              src={fullAvatarURL}
              
              className="rounded-full cursor-pointer w-[50px] h-[50px] object-cover"
              onClick={toggleMenu}
            />

            {/* Menu tài khoản */}
            {isOpen && (
              <div
                className={`absolute top-full right-0 bg-white p-4 rounded-2xl shadow-2xl z-10 w-56 ${
                  isOpen ? styles.menu_open : styles.menu_close
                } `}
              >
                {/* Thông tin người dùng */}
                <Link to={`/${user.username}`} onClick={()=>setIsOpen(false)} className="flex items-center gap-2 mb-4 hover:bg-gray-100 rounded-xl p-2 cursor-pointer">
                  <Icon
                    src={fullAvatarURL}
                    className="rounded-full cursor-pointer w-[50px] h-[50px] object-cover"
                  />
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-gray-400">@{user.username}</p>
                  </div>
                </Link>

                <div className="w-full h-[1px] bg-gray-200 my-2"></div>

                {/* Các tùy chọn */}
                <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100 rounded-md px-2">
                  <div className="flex items-center gap-2">
                    <Icon src={Setting} width={25} height={25} />
                    <span className="font-bold">Cài đặt</span>
                  </div>
                  <Icon src={RightArrow} width={15} height={15} />
                </div>

                <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100 rounded-md px-2">
                  <div className="flex items-center gap-2">
                    <Icon src={Help} width={25} height={25} />
                    <span className="font-bold">Hỗ trợ</span>
                  </div>
                  <Icon src={RightArrow} width={15} height={15} />
                </div>

                <div className="w-full h-[1px] bg-gray-200 my-2"></div>

                {/* Đăng xuất */}
                <div
                  onClick={logout}
                  className="flex-row-center gap-2 cursor-pointer py-2 hover:bg-gray-100 rounded-md px-2"
                >
                  <Icon src={Logout} width={25} height={25} />
                  <span>Đăng xuất</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
