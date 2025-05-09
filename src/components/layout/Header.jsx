import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import Logo from "../common/Logo";
import ControlBar from "../common/ControlBar";
import { Icon } from "../common/UIElement";
import { useAuth } from "../../context/AuthProvider";
import "../../styles/responsive.scss";

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
const defaultAvatar = `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`;
import {
  Add,
  AddChat,
  AddGroup,
  BackArrow,
  Call,
  CloseBlue,
  Edit,
  Emotion,
  File,
  Gif,
  Heart,
  ImageColorful,
  Microphone,
  Minimize,
  Options,
  Search2,
  Send,
  VideoCall,
} from "../../assets/icons/header/header";
import { Back, BackBlack, CloseBlack } from "../../assets/icons/main/main";
import { Circle, listFriends } from "../../assets/icons/rightbar/rightbar";
import LeftBar from '../layout/LeftBar'
import RightBar from '../layout/RightBar'
import DarkModeToggle from "../common/DarkModeToggle";  


const API_URL =
  import.meta.env.VITE_API_URL;

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
  const [isShowChat, setIsShowChat] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [isShowListContact, setIsShowListContact] = useState(true);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [isShowMedia, setIsShowMedia] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpenLeftBar, setIsOpenLeftBar] = useState(false);
  const [isShowRightBar, setIsShowRightBar] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const postCache = useRef([]);
  const historyRef = useRef(null);
  const postRef = useRef(null);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [selectedFriendId]);

  const handleSend = () => {
    if (input.trim() === "") return;
    const userMessage = {
      id: Date.now(),
      text: input,
      from: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const replyChat = {
        id: Date.now() + 1,
        text: `Đây là trang cá nhân chính thức ${selectedFriend.name}. Bạn đang gặp vấn đề gì, hãy chia sẽ với tôi!`,
        from: "bot",
        image: selectedFriend.image,
        name: selectedFriend.name,
      };
      setMessages((prev) => [...prev, replyChat]);
    }, 1000);
    setInput("");
    inputRef.current?.focus();
  };

  const handleToggleMedia = (e) => {
    const value = e.target.value;
    if (value.trim() === "") {
      setIsShowMedia(true);
    } else {
      setIsShowMedia(false);
    }
  };

  const selectedFriend = listFriends.find(
    (friends) => friends.id === selectedFriendId
  );

  const toggleMenu = (e) => {
    e.stopPropagation(); 
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
        const response = await fetch(`${API_URL}/posts`);
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
    { icon: Options }
  ];

  const location = useLocation();
  const activeControlCenters = controlCenterIcons.findIndex((tab) =>
    location.pathname.startsWith(tab.link)
  );

  const handleContactChat = (listId) => {
    setSelectedFriendId(listId);
    setIsShowChat(!isShowChat);
  };

  const controlRightIcons = [
    { icon: ChatIcon, link: null },
    { icon: NotiIcon, link: "/home" },
  ];
  

  return (
    <div className="flex-row-between m_flex-column-center t_justify-between bg-white px-4 py-0 fixed top-0 w-full z-50 shadow-md">
      {/* Logo + Tìm kiếm */}
      <div
        className={`flex-row-between gap-2 m_w-full m_m-2 ${
          isSearchOpen ? "m_justify-center" : ""
        }`}
      >
        <div className="relative flex items-center m_flex-row gap-2 ">
          <img
            src={MenuIcon}
            width={20}
            height={20}
            className="l_hidden  "
            alt=""
            onClick={() => setIsOpenLeftBar(!isOpenLeftBar)}
          />



          {isOpenLeftBar && (
            <LeftBar user={user} isOpenLeftBar={isOpenLeftBar} setIsOpenLeftBar={setIsOpenLeftBar} />
          )}
          <Link
            to="/home"
            className="flex items-center gap-2"
            onClick={closeSearch}
          >
            <Logo width="50" height="50" />
          </Link>
          <SearchBar
            placeholder="Tìm kiếm trên SpaceZone"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClick={toggleSearch}
            onSubmit={handleSearch}
            ref={searchRef}
            isOpenSearch={isSearchOpen}
            setIsOpenSearch={setIsSearchOpen}
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
                        className="flex m_flex-row justify-between p-2 hover:bg-gray-200 rounded-xl cursor-pointer "
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

                            <div className="flex flex-col m_flex-row items-start gap-1 ">
                              <p
                                className={`font-semibold text-black text-left ${styles.text_limitLine} `}
                              >
                                {post.content || "Không có tiêu đề"}
                              </p>
                              <p className="text-sm text-gray-500">
                                <span className="font-bold text-blue-600">
                                  Tác giả:{" "}
                                </span>{" "}
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

        {/* Thanh điều hướng phải */}
        <div
          className={`l_hidden t_hidden flex-row-end gap-4 relative ${
            isSearchOpen ? "m_hidden" : ""
          } `}
        >
          <ControlBar
            icons={controlRightIcons}
            size="25"
            className="flex-row-center gap-2 "
            classNames={`rounded-full p-2 hover:bg-gray-200 cursor-pointer ${styles.bgElement}`}
            onClickControlCenter={(index) => {
              if (index === 0) {
                setIsShowChat((prev) => !prev);
              } else {
                setActiveControlCenter(index);
              }
            }}
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
                  className={`absolute min-w-[250px] top-full right-0 bg-white p-4 rounded-2xl shadow-2xl z-10 w-56 ${
                    isOpen ? styles.menu_open : styles.menu_close
                  } `}
                >
                  {/* Thông tin người dùng */}
                  <Link
                    to={`/${user.username}`}
                    onClick={() => setIsOpen(false)}
                    className="flex justify-around items-center m_flex-row gap-2 mb-4 hover:bg-gray-100 rounded-xl p-2 cursor-pointer"
                  >
                    <Icon
                      src={fullAvatarURL}
                      className="rounded-full cursor-pointer w-[50px] h-[50px] object-cover"
                    />
                    <div>
                      <p className="font-bold text-black whitespace-nowrap text-ellipsis overflow-hidden w-[150px]">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-400">@{user.username}</p>
                    </div>
                  </Link>

                  <div className="w-full h-[1px] bg-gray-200 my-2"></div>

                  {/* Các tùy chọn */}
                  <div className="flex items-center justify-between m_flex-row py-2 cursor-pointer hover:bg-gray-100 rounded-md px-2">
                    <div className="flex items-center m_flex-row gap-2">
                      <Icon src={Setting} width={25} height={25} />
                      <span className="font-bold">Cài đặt</span>
                    </div>
                    <Icon src={RightArrow} width={15} height={15} />
                  </div>

                  <div className="flex items-center justify-between m_flex-row py-2 cursor-pointer hover:bg-gray-100 rounded-md px-2">
                    <div className="flex items-center m_flex-row gap-2">
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

                <DarkModeToggle />

                </div>

              )}


            </div>
          )}
        </div>
      </div>

      {/* Thanh điều hướng trung tâm */}
      <ControlBar
        icons={controlCenterIcons}
        className="flex-row-between xl:w-[40%] m_fixed-blr m_bg-white p-1"
        classNames="py-4 px-10 m_px-6 my-1 m_m-0 rounded-lg m_br-none cursor-pointer "
        active={activeControlCenters}
        onClickControlCenter={setActiveControlCenter}
        onClickRightBar={()=>setIsShowRightBar(!isShowRightBar)}
        setIsShowRightBar={setIsShowRightBar}
      />

      <div className="w-full l_hidden"t_hidden >
        <RightBar isShowRightBar={isShowRightBar} />
      </div>


      {/* Thanh điều hướng phải */}
      <div className={`m_hidden flex-row-end gap-4 relative xl:w-[25%] `}>
        <ControlBar
          icons={controlRightIcons}
          size="25"
          className="flex-row-center gap-2 "
          classNames={`rounded-full p-2 hover:bg-gray-200 cursor-pointer ${styles.bgElement}`}
          onClickControlCenter={(index) => {
            if (index === 0) {
              setIsShowChat((prev) => !prev);
            } else {
              setActiveControlCenter(index);
            }
          }}
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
                className={`absolute min-w-[250px] top-full right-0 bg-white p-4 rounded-2xl shadow-2xl z-10 w-56 ${
                  isOpen ? styles.menu_open : styles.menu_close
                } `}
              >
                {/* Thông tin người dùng */}
                <Link
                  to={`/${user.username}`}
                  onClick={() => setIsOpen(false)}
                  className="flex justify-around items-center gap-2 mb-4 hover:bg-gray-100 rounded-xl p-2 cursor-pointer"
                >
                  <Icon
                    src={fullAvatarURL}
                    className="rounded-full cursor-pointer w-[50px] h-[50px] object-cover"
                  />
                  <div>
                    <p className="font-bold text-black whitespace-nowrap text-ellipsis overflow-hidden w-[150px]">
                      {user.name}
                    </p>
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

                <DarkModeToggle />

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

      {/* Nhắn tin - Chat */}
      <div
        className="fixed bottom-2 right-4 mc_addChatIcon m_hidden cursor-pointer"
        onClick={() => setIsShowChat(!isShowChat)}
      >
        <img src={AddChat} width={60} height={60} alt="" />
      </div>

      {isShowChat && (
        <div className="fixed bottom-0 lg:right-[100px] h-[400px] w-[350px] m_absolute m_top-full m_w-full m_h-screen z-50 t_h-849px bg-white lg:shadow-2xl rounded-tr-lg rounded-tl-lg border-[1px] border-gray-300 p-1 animate__animated animate__fadeIn">
          <div className="flex-row-between ">
            <div className="flex-row-center gap-1">
              <div
                className="hover:bg-gray-300 rounded-full p-2 cursor-pointer"
                onClick={() => setIsShowChat(false)}
              >
                <img src={BackBlack} width={15} height={20} alt="" />
              </div>
              <h3 className="font-bold text-[16px] ">
                Bắt đầu cuộc trò chuyện mới
              </h3>
            </div>
            <div className="hover:bg-gray-300 rounded-full p-2 cursor-pointer">
              <img src={AddGroup} width={30} height={20} alt="" />
            </div>
          </div>
          <div
            className="relative flex-row-center gap-1 px-2 cursor-pointer"
            onClick={() => setIsShowListContact(true)}
          >
            <img src={Search2} width={20} height={20} alt="" />
            <input
              type="text"
              placeholder="Tìm kiếm liên hệ"
              className="w-full p-2 outline-none text-black placeholder:text-gray-500"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
            />
          </div>
          <div className="relative w-full h-[1px] bg-gray-300 my-2">
            {isShowListContact && (
              <div className="absolute top-full w-full overflow-y-scroll lg:max-h-[300px] m_max-h-screen mt-1 animate__animated animate__fadeIn">
                {listFriends
                  .filter((list) =>
                    list.name
                      .toLowerCase()
                      .includes(contactSearch.toLowerCase())
                  )
                  .map((list, index) => (
                    <div
                      key={index}
                      className="flex-row-start gap-2  mx-1 cursor-pointer hover:bg-gray-200 rounded-md p-2"
                      onClick={() => handleContactChat(list.id)}
                    >
                      <img
                        src={list.image}
                        width={40}
                        height={40}
                        className="rounded-full m_w-h-30"
                        alt=""
                      />
                      <span>{list.name}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedFriend && (
        <div className="fixed bottom-0 lg:right-[100px] h-[420px] w-[350px] m_absolute m_top-full m_w-full m_h-82vh bg-white lg:shadow-2xl rounded-tr-lg rounded-tl-lg border-[1px] border-gray-300 animate__animated animate__fadeIn">
          <div className="sticky top-0 right-0 left-0 flex-row-between  border-b-[1px] border-gray-300 p-2 shadow-md">
            <div className="flex-row-center gap-2">
              <div className="relative">
                <img
                  src={selectedFriend.image}
                  width={40}
                  height={20}
                  className="rounded-full"
                  alt=""
                />
                <img
                  className="absolute bottom-0 right-0 shadow-xl"
                  src={Circle}
                  width={12}
                  height={12}
                  alt=""
                />
              </div>
              <div className="flex-column-start m_flex-row">
                <div className="flex-row-center m_flex-row gap-1">
                  <h3 className="text-left font-bold text-[15px] text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                    {selectedFriend.name}
                  </h3>
                  <img src={Edit} width={15} alt="" />
                </div>
                <span className="text-gray-500 text-xs">Vừa mới truy cập</span>
              </div>
            </div>
            <div className="flex-row-between m_flex-row gap-2">
              <img src={Call} width={25} height={20} alt="" />
              <img src={VideoCall} width={25} height={20} alt="" />
              <img
                src={Minimize}
                width={25}
                height={20}
                alt=""
                onClick={() => {
                  setSelectedFriendId(false);
                  setIsShowChat(true);
                }}
              />
              <img
                src={CloseBlue}
                width={25}
                height={20}
                alt=""
                onClick={() => setSelectedFriendId(false)}
              />
            </div>
          </div>
          {/* <div className="w-full h-[1px] bg-gray-300 "></div> */}
          {/* {messages.map((message, index) => (
            <div key={index} className="flex justify-end">
              <span className=" px-4 py-2 bg-blue-600 text-white m-2 rounded-full inline-block ">
                {message}
              </span>
            </div>
          ))} */}
          <div className="overflow-y-scroll max-h-[300px] m_max-h-screen p-2">
            <div className="flex-column-center gap-1">
              <div className="relative inline-block">
                <img
                  src={selectedFriend.image}
                  width={70}
                  height={70}
                  alt=""
                  className="rounded-full"
                />
                <img
                  src={Circle}
                  width={15}
                  height={15}
                  alt=""
                  className="absolute bottom-0 right-0"
                />
              </div>
              <h3 className="font-bold text-lg">{selectedFriend.name}</h3>
              <p>Các bạn là bạn bè trên Facebook</p>
              <p>Sống tại Thành Phố Hồ Chí Minh</p>
              <button className="outline-none bg-gray-100 hover:bg-gray-100">
                Xem trang cá nhân
              </button>
            </div>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex   ${
                  message.from === "user"
                    ? "m_flex-row justify-end"
                    : "m_flex-row justify-start items-center"
                } animate__animated animate__fadeIn`}
              >
                {message.from === "bot" && (
                  <img
                    src={message.image}
                    className=" w-[35px] h-[35px] rounded-full"
                    alt=""
                  />
                )}
                <span
                  className={`px-4 py-2 ${
                    message.from === "user"
                      ? "bg-blue-500 text-gray-400"
                      : "bg-gray-300 text-white "
                  } text-left max-w-[210px] m-1 rounded-xl`}
                >
                  {message.text}
                </span>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <div className="absolute bottom-0 right-0 left-0 flex-row-between gap-2 p-2 border-t-[1px] shadow_chatBar border-gray-300">
            {isShowMedia && input.trim() === "" ? (
              <div className="flex-row-center gap-2 cursor-pointer">
                <img src={Microphone} width={25} height={30} alt="" />
                <img src={ImageColorful} width={25} height={30} alt="" />
                <img src={File} width={25} height={30} alt="" />
                <img src={Gif} width={25} height={30} alt="" />
              </div>
            ) : (
              <div>
                <img src={Add} width={25} height={25} alt="" />
              </div>
            )}

            <div
              className={`flex items-center relative ${
                isShowMedia ? "" : "w-full"
              } transition-all duration-300 ease-in-out `}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                className="border-[1px] shadow-md rounded-full  w-full p-2 outline-none break-words"
                onChange={(e) => {
                  setInput(e.target.value);
                  handleToggleMedia(e);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <img
                src={Emotion}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer`}
                width={25}
                height={20}
                alt=""
              />
            </div>
            {isShowMedia && input.trim() === "" ? (
              <div>
                <img
                  src={Heart}
                  width={25}
                  height={30}
                  alt=""
                  className="cursor-pointer"
                />
              </div>
            ) : (
              <div>
                <img
                  src={Send}
                  width={25}
                  height={30}
                  alt=""
                  className="cursor-pointer"
                  onClick={handleSend}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
