import { useMemo, useState, useEffect, useRef } from "react";
import {
  More,
  CloseBlack,
  Like,
  Share,
  Comment,
  Save,
  Repeat,
  Tick,
  Time,
  LikeColorful,
  Heart,
  Haha,
  HeartEmpty,
  Liked,
  emotionOptions,
  animationClasses,
} from "../../../assets/icons/main/main";
import styled from "../Main.module.scss";
import "animate.css";
import ReactionList from "../animation/ReactionList";
import Lottie from "lottie-react";
import { reactions } from "../animation/ReactionList";
import ShareComponent from "../Share";
const defaultAvatar = `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`;
// import Comments from "../Comments";
import CommentDetail from "../CreatePost/CommentDetail";
import { Link } from "react-router-dom";
import { useRealTimeUser } from "../../../hooks/useRealTimeUser";
import { FriendRequestsList } from "../../friends";
const API_URL = import.meta.env.VITE_API_URL

function PostList({
  posts = [], // Add default empty array
  comments,
  onDelete,
  onAddComment,
  onDeleteComment,
  disableCommentButton = false,
  user,
  loading,
  deletingPostId,
  setComments
}) {
  
  const currentUser = useRealTimeUser(user);
  const [likePosts, setLikePosts] = useState({});
  const randomShares = useMemo(() => Math.floor(Math.random() * 100), []);
  const [showEmotions, setShowEmotions] = useState(false);
  const pressTimer = useRef(null);
  const timeoutRef = useRef(null);
  const [selectedReaction, setSelectedReaction] = useState({});
  const [isOpenCommentDetail, setIsOpenCommentDetail] = useState(null);
  const [isShowShare, setIsShowShare] = useState(false);
  const [isShowFriendRequests, setIsShowFriendRequests] = useState(false);
  const postEndRef = useRef(null);

  useEffect(() => {
    // Lấy bình luận từ localStorage nếu có
    if (Array.isArray(posts) && posts.length > 0) {
      const storedComments = localStorage.getItem(`comments_${posts[0]?.id}`);
      if (storedComments) {
        setComments(JSON.parse(storedComments)); // Set bình luận từ localStorage vào state
      }
    }
  }, [posts, setComments]);

  const handlePressStart = (postId) => {
    pressTimer.current = setTimeout(()=>{
      setShowEmotions(postId);
    }, 500);
  }

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null;
    }
  }

  useEffect(() => {
    postEndRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [posts]);

  // Cập nhật localComments khi comments thay đổi
  

  const handleMouseEnter = (postId) => {
    // Hủy bỏ setTimeout nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowEmotions(postId);
    }, 500);
  };

  const handleMouseLeave = (postId) => {
    // Hủy bỏ setTimeout nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowEmotions(false);
    }, 600);
  };

  const handleSelectReaction = (postId, reaction) => {
    setSelectedReaction((prev) => ({
      ...prev,
      [postId]: reaction,
    }));

    // Khi chọn reaction, tự động xem là đã like
    setLikePosts((prev) => ({
      ...prev,
      [postId]: true,
    }));
    setShowEmotions(null);
  };

  // Khởi tạo số lượt thích ngẫu nhiên cho mỗi bài post
  const [randomLikes, setRandomLikes] = useState(() => {
    const storedLikes = localStorage.getItem("randomLikes");
    const sessionLikes = localStorage.getItem("randomLikes");

    if (storedLikes) {
      return JSON.parse(storedLikes);
    } else if (sessionLikes) {
      return JSON.parse(sessionLikes);
    }

    // Nếu localStorage và localStorage đều không có, tạo số like ngẫu nhiên
    const initialLikes = Array.isArray(posts) ? posts.reduce((acc, post) => {
      acc[post._id] = Math.floor(Math.random() * 100);
      return acc;
    }, {}) : {};

    // Lưu vào localStorage để tránh bị reset nếu xóa localStorage
    localStorage.setItem("randomLikes", JSON.stringify(initialLikes));
    return initialLikes;
  });

  useEffect(() => {
    setRandomLikes((prevLikes) => {
      const newLikes = { ...prevLikes };
      if (Array.isArray(posts)) {
        posts.forEach((post) => {
          if (!newLikes[post._id]) {
            newLikes[post._id] = Math.floor(Math.random() * 1000) + 100;
          }
        });
      }
      return newLikes;
    });
  }, [posts]);

  const handleLike = (postId) => {
    setLikePosts((prev) => {
      const isCurrentlyLiked = prev[postId] || false;

      // Nếu đang unlike (bỏ like), reset cả reaction
      if (isCurrentlyLiked) {
        setSelectedReaction((prevReactions) => ({
          ...prevReactions,
          [postId]: null, // Reset reaction về null khi unlike
        }));
      }

      return { ...prev, [postId]: !isCurrentlyLiked };
    });

    // Cập nhật số like
    setRandomLikes((prev) => {
      const updatedLikes = {
        ...prev,
        [postId]: likePosts[postId] ? prev[postId] - 1 : prev[postId] + 1,
      };
      localStorage.setItem("randomLikes", JSON.stringify(updatedLikes));
      return updatedLikes;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("vi-VN", {
      hour: "numeric",
      minute: "numeric",
    });
    return `${formattedDate} - ${formattedTime}`;
  };

  return (
    <div>
      {!Array.isArray(posts) || posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6 text-center my-4">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">👥</div>
            <h3 className="text-lg font-bold text-gray-700">Chưa có bài viết nào</h3>
            <p className="text-gray-500 max-w-md">
              {!Array.isArray(posts) ? 
                "Có lỗi khi tải bài viết. Vui lòng thử lại." :
                "Bạn chưa có bạn bè nào hoặc bạn bè chưa đăng bài viết. Hãy kết bạn để xem bài viết của họ!"
              }
            </p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setIsShowFriendRequests(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Tìm bạn bè
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Làm mới
              </button>
            </div>
          </div>
        </div>
      ) : (
        posts.map((post) => {
          const fullAvatarURL = post.author?.avatar
            ? `${API_URL}${post.author.avatar}`
            : defaultAvatar;
          const fullImageURL = post.image ? `${API_URL}${post.image}` : null;
          const isLiked = likePosts[post._id] || false;
          const likeCount = randomLikes[post._id] || 0;
          // const postComments = comments.filter(
          //   (comment) => comment.postId === post._id
          // );

          return (
            <div
              key={post._id}
              className={` relative bg-white my-2 rounded-lg shadow-md border border-gray-300 m_m-2 `}
            >
              {isOpenCommentDetail === post._id && (
                <div>
                  <CommentDetail
                    posts={post}
                    comments={comments}
                    onDeleteComment={onDeleteComment}
                    onAddComment={onAddComment}
                    onDelete={onDelete}
                    isOpenCommentDetail={isOpenCommentDetail}
                    setIsOpenCommentDetail={setIsOpenCommentDetail}
                    loading={loading}
                    setComments={setComments}
                  />
                </div>
              )}

              {isShowShare === post._id && (
                <div>
                  <ShareComponent 
                    onClose={() => setIsShowShare(null)} 
                    postId={post._id}
                    postData={post}
                  />
                </div>
              )}

              <div className={` flex justify-start items-start m_flex-row w-full`}>
                <Link
                  to={`/${post.author?.username || ""}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={fullAvatarURL}
                    className="rounded-full m-3 cursor-pointer w-[50px] h-[50px] m_w-h-40 object-cover "
                    alt=""
                  />
                </Link>
                {/* Thong tin bai viet */}
                <div className="w-full">
                  <div className="flex-row-between pt-3">
                    <div className="flex-row-start gap-2">
                      <div className="flex flex-col m_flex-row items-start justify-center cursor-pointer">
                        <div className="flex-row-center gap-2">
                          <div className="flex-row-center gap-1">
                          <Link to={`/${post.author?.username}`}>
                            <p className="font-bold text-black ms_text-10px">{post.author.name}</p>
                          
                          </Link>
                            <img src={Tick} width={15} height={15} alt="" />
                          </div>
                          <Link to={`/${post.author?.username}`}>
                          
                         <p className="font-medium text-gray-600 ms_text-10px">
                            @{post.author.username}
                          </p> 
                          </Link>
                        </div>
                        <div className="flex-row-center gap-1">
                          <img src={Time} width={15} height={15} alt="" />
                          <span className="text-gray-500 ms_text-10px">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-row-center gap-4 mx-4">
                      <img
                        src={More}
                        width={20}
                        height={20}
                        alt=""
                        className="cursor-pointer m_w-10px m_h-10px"
                      />
                      {deletingPostId === post._id ? (
                        <div className={`${styled.loading__spinner}`}></div>
                      ) : (
                        <img
                          onClick={() => onDelete(post._id)}
                          src={CloseBlack}
                          width={15}
                          height={20}
                          alt=""
                          className="cursor-pointer m_w-10px m_h-10px"
                        />
                      )}
                    </div>
                  </div>
                  {/* Noi dung bai viet */}
                  <div className="flex flex-col">
                    <div className="text-left pb-3">
                      <p className={`${styled.font_custom} pr-4 py-2 ms_text-10px`}>
                        {post.content}
                      </p>
                    </div>
                    {fullImageURL && (
                      <div
                        className="flex-column-center pr-2 cursor-pointer"
                        onClick={() =>
                          !disableCommentButton &&
                          setIsOpenCommentDetail((prev) =>
                            prev === post._id ? null : post._id
                          )
                        }
                      >
                        <img
                          src={fullImageURL}
                          alt=""
                          className="rounded-xl shadow-md border border-gray-300 "
                        />
                      </div>
                    )}
                  </div>
                  {/* Thống kê cảm xúc */}
                  <div className="flex-row-between p-2">
                    <div className="flex-row-center gap-1 cursor-pointer">
                      <div className="flex-row-center relative w-[50px] h-[20px]">
                        <img
                          src={LikeColorful}
                          width={20}
                          height={20}
                          alt=""
                          className="rounded-full absolute top-0 left-0"
                        />
                        <img
                          src={Heart}
                          width={20}
                          height={20}
                          alt=""
                          className="rounded-full absolute top-0 left-[14px]"
                        />
                        <img
                          src={Haha}
                          width={20}
                          height={20}
                          alt=""
                          className="rounded-full absolute top-0 left-[28px]"
                        />
                      </div>
                      <span className="font-medium text-gray-500 ms_text-10px">
                        {likeCount.toLocaleString()}K
                      </span>
                    </div>
                    <div className="flex-row-center gap-2">
                      <span className="font-medium text-gray-500 ms_text-10px">
                        {(comments?.length || 0).toLocaleString()} bình luận
                      </span>
                      <div className="h-[12px] w-[2px] tranlate-y-1/2 bg-gray-300"></div>
                      <span className="font-medium text-gray-500 cursor-pointer ms_text-10px">
                        {randomShares.toLocaleString()} lượt chia sẻ
                      </span>
                    </div>
                  </div>
                  <div className="h-[1px] bg-gray-300"></div>

                  {/* Biểu tượng cảm xúc */}
                  <div className="relative py-1 px-2 ">
                    <div className="flex-row-between ">
                      <div
                        onClick={() => handleLike(post._id)}
                        onTouchStart={() => handlePressStart(post._id)}
                        onTouchEnd={handlePressEnd}
                        onMouseDown={() => handlePressStart(post._id)}
                        onMouseUp={handlePressEnd}
                        onMouseEnter={() => handleMouseEnter(post._id)}
                        onMouseLeave={() => handleMouseLeave(post._id)}
                        className="flex-row-center gap-2  hover:bg-gray-200 p-2 rounded-lg cursor-pointer w-full "
                      >
                        <div
                          className="flex-row-center gap-2"
                          onClick={() => setSelectedReaction(!showEmotions)}
                        >
                          {isLiked ? (
                            <Lottie
                              animationData={
                                selectedReaction[post._id]?.animation ||
                                reactions[0].animation
                              }
                              className="w-[25px] h-[25px]"
                              loop={false}
                            />
                          ) : selectedReaction[post._id] ? (
                            // Nếu đã chọn reaction nhưng chưa like, kiểm tra xem có phải là Like không
                            selectedReaction[post._id]?.name === "Like" ? (
                              <img
                                src={Like}
                                width={20}
                                height={20}
                                alt="Like"
                              />
                            ) : (
                              <Lottie
                                animationData={
                                  selectedReaction[post._id]?.animation
                                }
                                className="w-[25px] h-[25px]"
                                loop={false}
                              />
                            )
                          ) : (
                            // Khi chưa chọn gì, hiển thị Like rỗng
                            <div className="flex-row-center w-[25px] h-[25px]">
                              <img
                                src={Like}
                                width={20}
                                height={20}
                                alt="Like"
                              />
                            </div>
                          )}

                          <span
                            className={`font-bold  ${
                              isLiked ? "text-blue-500 ms_text-10px" : "text-gray-500 ms_text-10px"
                            }`}
                          >
                            {selectedReaction[post._id]?.name || "Like"}
                          </span>
                        </div>
                        <div className="absolute top-0 left-0 h-[20px] bg-transparent w-[100px]"></div>
                      </div>

                      <div
                        className="flex-row-center gap-2  hover:bg-gray-200 p-2 rounded-lg cursor-pointer w-full "
                        onClick={() =>
                          !disableCommentButton &&
                          setIsOpenCommentDetail((prev) =>
                            prev === post._id ? null : post._id
                          )
                        }
                      >
                        <img src={Comment} width={20} height={20} alt="" />
                        <span className="font-semibold text-gray-500 whitespace-nowrap ms_text-10px">
                          Bình luận
                        </span>
                      </div>

                      {/* Bình luận chi tiết */}
                      {/* <Comments posts={posts} comments={comments} onDeleteComment={onDeleteComment} onAddComment={onAddComment} onClickLike = {handleLike} likePosts={likePosts} /> */}

                      <div
                        className="flex-row-center gap-2  hover:bg-gray-200 p-2 rounded-lg cursor-pointer w-full "
                        onClick={() =>
                          setIsShowShare((prev) =>
                            prev === post._id ? null : post._id
                          )
                        }
                      >
                        <img src={Share} width={20} height={20} alt="" />
                        <span className="font-semibold text-gray-500 whitespace-nowrap ms_text-10px">
                          Chia sẻ
                        </span>
                      </div>
                      <div className="flex-row-start gap-2 ">
                        <Save className="w-5 h-5 text-black hover:text-green-600 cursor-pointer" />
                        <Repeat className="w-5 h-5 text-black hover:text-green-600 cursor-pointer" />
                      </div>
                    </div>

                    {/* Emotion Options */}
                    {showEmotions === post._id && (
                      <ReactionList
                        onSelectReaction={(reaction) =>
                          handleSelectReaction(post._id, reaction)
                        }
                      />
                    )}
                  </div>
                </div>
                <div ref={postEndRef} />
              </div>
            </div>
          );
        })
      )}
      
      {/* Friend Requests Modal */}
      <FriendRequestsList 
        isOpen={isShowFriendRequests}
        onClose={() => setIsShowFriendRequests(false)}
      />
    </div>
  );
}

export default PostList;
