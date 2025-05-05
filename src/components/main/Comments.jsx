import { useEffect, useRef, useState } from "react";
import { Comment, HeartEmpty, HeartFill } from "../../assets/icons/main/main";
import { TranThanh } from "../../assets/icons/rightbar/rightbar";
const defaultCover = `${import.meta.env.VITE_API_URL}/uploads/cover/default_cover.png`;
const defaultAvatar = `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`;

function Comments({
  posts,
  comments,
  onDeleteComment,
  onAddComment,
  onClickLike,
  likePosts,
}) {
  const [openComments, setOpenComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showReply, setShowReply] = useState(false);
  const [likeReply, setLikeReply] = useState(false);
  const inputComment = useRef(null);
  const [replyLikeStates, setReplyLikeStates] = useState({});
  const [likeStates, setLikeStates] = useState(() => {
    // Đảm bảo comments là một mảng trước khi reduce
    if (!Array.isArray(comments)) {
      return {};
    }
    return comments.reduce((acc, comment) => {
      // Kiểm tra comment và comment._id tồn tại
      if (comment && comment._id) {
        const storedIsLiked = localStorage.getItem(`isLikedComment_${comment._id}`);
        const storedLikeCount = localStorage.getItem(`randomLikeComment_${comment._id}`);

        acc[comment._id] = {
          isLiked: storedIsLiked ? JSON.parse(storedIsLiked) : false,
          // Thay đổi ở đây: Nếu không có giá trị, mặc định là 0
          likeCount: storedLikeCount ? parseInt(storedLikeCount, 10) : 0
        };
      }
      return acc;
    }, {});
  });

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    Object.entries(likeStates).forEach(
      ([commentId, { isLiked, likeCount }]) => {
        localStorage.setItem(
          `isLikedComment_${commentId}`,
          JSON.stringify(isLiked)
        );
        localStorage.setItem(`randomLikeComment_${commentId}`, likeCount);
      }
    );
  }, [likeStates]);

  const toggleComments = (postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleReply = (commentId) => {
    setShowReply((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleCommentChange = (postId, text) => {
    setNewComment((prev) => ({
      ...prev,
      [postId]: text,
    }));
  };

  const handleAddComment = (postId) => {
    if (newComment[postId]?.trim()) {
      onAddComment(postId, newComment[postId]);
      setNewComment((prev) => ({
        ...prev,
        [postId]: "",
      }));
    }
    inputComment.current?.focus();
  };

  const handleLikeComment = (commentId) => {
    setLikeStates((prev) => {
      const currentState = prev[commentId] || { isLiked: false, likeCount: 0 };
      const isLiked = !currentState.isLiked;
      const likeCount = currentState.likeCount + (isLiked ? 1 : -1);

      // Cập nhật lại localStorage khi like thay đổi
      localStorage.setItem(
        `isLikedComment_${commentId}`,
        JSON.stringify(isLiked)
      );
      localStorage.setItem(`randomLikeComment_${commentId}`, likeCount.toString());

      return {
        ...prev,
        [commentId]: { isLiked, likeCount },
      };
    });
    onClickLike(commentId);
  };

  const handleLikeCountReply = (commentId) => {
    setReplyLikeStates((prev) => {
      const isLiked = !prev[commentId]?.isLiked; // Đảo trạng thái like
      const likeCount = (prev[commentId]?.likeCount || 0) + (isLiked ? 1 : -1);

      return {
        ...prev,
        [commentId]: { isLiked, likeCount },
      };
    });
  };

  const postComments = comments.filter((comment) => {
    if (typeof comment.postId === "object" && comment.postId._id) {
      return comment.postId._id === posts._id;
    }

    return comment.postId === posts._id;
  }
);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date; /* ms */
    const diffInMinutes = Math.floor(
      diff / (1000 * 60)
    ); /* ms/1000 -> đổi ra s, *60 đổi ra phút */
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className={`  bg-white w-full rounded-md p-4  `}>
      <div>
        {/* <div onClick={() => toggleComments(posts._id)}>
          {openComments[posts._id] ? "Ẩn bình luận" : "Xem bình luận"}
        </div> */}

        {/* {openComments[posts._id] && ( */}
        <div>
          {postComments.length === 0 ? (
            <p className="font-bold text-gray-400 mb-4">
              Chưa có bình luận nào
            </p>
          ) : (
            postComments.map((comment, index) => {
              const { isLiked, likeCount } = likeStates[comment._id] || {};

              return (
                <div className="my-2">
                  <div className="flex-row-between" key={index}>
                    <div className="flex-row-center gap-2">
                      <div className="min-h-[80px]">
                        <img
                          src={posts.author.avatar ? `${API_URL}${posts.author.avatar}` : defaultAvatar}
                          alt=""
                          className="rounded-full w-[50px] h-[50px] object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex flex-col m_flex-row justify-start items-start">
                          <span className="font-semibold cursor-pointer">
                            {posts.author.name}
                          </span>
                          <p className="text-left">{comment.text}</p>
                        </div>
                        <div className="flex-row-start gap-2 my-1">
                          <span className="text-gray-400 ">
                            {formatTime(comment.createdAt)}
                          </span>
                          <div className="flex-row-center gap-1">
                            <img
                              src={isLiked ? HeartFill : HeartEmpty}
                              width={20}
                              height={20}
                              alt=""
                              onClick={() => handleLikeComment(comment._id)}
                              className={
                                isLiked
                                  ? "animate__animated animate__rubberBand"
                                  : ""
                              }
                            />
                            <span>{likeCount}</span>
                          </div>
                          <div className="flex-row-center gap-1 cursor-pointer">
                            <img src={Comment} width={20} height={20} alt="" />
                            <span>1</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteComment(comment._id)}
                      className="bg-red-500 text-white shadow-xl hover:bg-[rgb(255,0,0)]"
                    >
                      Xoá
                    </button>
                  </div>

                  <div className="flex-column-start gap-2 cursor-pointer ">
                    <div
                      className="flex items-center justify-start m_flex-row gap-2 my-1 w-full"
                      onClick={() => toggleReply(comment._id)}
                    >
                      <div className="h-[1px] w-[50px] bg-gray-400"></div>
                      <span className="font-semibold text-gray-500">
                        {showReply[comment._id]
                          ? "Ẩn bớt bình luận"
                          : "Xem thêm bình luận"}
                      </span>
                    </div>

                    {showReply[comment._id] && (
                      <div className="flex-row-center m_flex-row gap-2 ml-14 animate__animated animate__bounceIn animate__faster">
                        <div className="min-h-[80px]">
                          <img
                            src={TranThanh}
                            width={40}
                            height={40}
                            alt=""
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <div className="flex flex-col m_flex-row justify-start items-start">
                            <span className="font-semibold cursor-pointer">
                              Trấn Thành Official
                            </span>
                            <p className="text-left">
                              Cảm ơn bạn đã tương tác bài viết nha! Chúc bạn
                              ngày mới vui vẻ!
                            </p>
                          </div>
                          <div className="flex-row-start gap-2 my-1">
                            <span className="text-gray-400 ">5 phút trước</span>
                            <div className="flex-row-center gap-1">
                              <img
                                src={
                                  replyLikeStates[comment._id]?.isLiked
                                    ? HeartFill
                                    : HeartEmpty
                                }
                                width={20}
                                height={20}
                                alt=""
                                onClick={() =>
                                  handleLikeCountReply(comment._id)
                                }
                                className={
                                  isLiked
                                  ? "animate__animated animate__rubberBand"
                                  : ""
                                }
                              />
                              <span>
                                {replyLikeStates[comment._id]?.likeCount || 0}
                              </span>
                            </div>
                            <div className="flex-row-center gap-1">
                              <img
                                src={Comment}
                                width={20}
                                height={20}
                                alt=""
                              />
                              <span>5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* )} */}

        <div className="bg-white sticky left-0 bottom-0 pb-2 w-full">
          <div className=" flex-row-center gap-2">
            <input
              ref={inputComment}
              type="text"
              value={newComment[posts._id] || ""}
              onChange={(e) => handleCommentChange(posts._id, e.target.value)}
              placeholder="Viết bình luận ..."
              className="w-full border-2 border-gray-300 outline-none p-2 rounded-lg"
            />
            <button onClick={() => handleAddComment(posts._id)} className="bg-blue-600 text-white hover:bg-blue-500">Gửi</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Comments;
