import { useState } from "react";
import PropTypes from "prop-types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { UserSearchModal } from "../friends";
import { startChatWithFriend } from "../../utils/friendChatIntegration";
import { useAuth } from "../../context/AuthProvider";
import Plus from "../../assets/icons/main/plus.png";

const API_URL = import.meta.env.VITE_API_URL;
const defaultAvatar = `${API_URL}/uploads/avatar/default.png`;

const ConversationList = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  onlineUsers = new Set(),
  loading,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showConversationSearch, setShowConversationSearch] = useState(true);

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm.trim()) return true;

    return conversation.participants.some(
      (participant) =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatLastMessageTime = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      if (diffHours >= 1) return `${diffHours} giờ `;
      if (diffMinutes >= 1) return `${diffMinutes} phút `;
      return `Vừa xong`;
    }


    const day = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    return ` ${day}`;
  } catch {
    return "";
  }
};


  const getOtherParticipant = (conversation, currentUserId) => {
    return conversation.participants.find((p) => p._id !== currentUserId);
  };

  const renderConversationItem = (conversation) => {
    const currentUserId = user?._id || user?.id;
    const otherParticipant = getOtherParticipant(conversation, currentUserId);
    const isActive = activeConversation?._id === conversation._id;
    const isOnline = otherParticipant && onlineUsers.has(otherParticipant._id);
    const hasUnreadMessages = conversation.unreadCount > 0;

    // Format avatar URL
    const avatarUrl = otherParticipant?.avatar
      ? otherParticipant.avatar.startsWith("http")
        ? otherParticipant.avatar
        : `${API_URL}${otherParticipant.avatar}`
      : defaultAvatar;

    return (
      <div
        key={conversation._id}
        className={`flex items-center gap-3 p-3 m-1 cursor-pointer transition-all duration-200 border-l-3 border-transparent relative bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg hover:border-l-pink-500 ${
          isActive ? "bg-blue-50 dark:bg-gray-700 border-l-blue-500" : ""
        }`}
        onClick={() => onSelectConversation(conversation)}
        style={{display: "flex",}}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt={otherParticipant?.name || otherParticipant?.username || "User"}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            onError={(e) => {
              e.target.src = defaultAvatar;
            }}
          />
          {hasUnreadMessages && (
              <div className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs font-semibold px-1 py-0.5 rounded-full min-w-[18px] text-center">
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </div>
            )}
          {isOnline && <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>}
        </div>

        {/* Conversation Info */}
        <div className="flex-1 min-w-0  flex flex-col items-start" style={{display: "flex",}}>
          <div className="flex items-center justify-between mb-0.5" >
            <div className="flex items-center justify-start gap-1 w-fit mx-auto"  style={{display: "flex",}}>
            {/* Friendship Status Indicator */}
            

            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate flex-1">
              {otherParticipant?.name ||
                otherParticipant?.username ||
                "Người dùng"}
            </span>

            {conversation.friendshipStatus && (
              <div className="text-xs ml-1 opacity-80">
                {conversation.friendshipStatus === "accepted" && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
                {conversation.friendshipStatus === "pending" && "⏳"}
                {conversation.friendshipStatus === "blocked" && "🚫"}
                {conversation.friendshipStatus === "none" && "⚠️"}
              </div>
            )}
            </div>

            
          </div>

          

          <div className="flex items-center justify-start gap-2  w-full" style={{display: "flex",}}>
            {conversation.lastMessage ? (
              <div className="flex-1 min-w-0 flex " style={{display: "flex",}}>
                <span
                  className={`text-xs text-blue-600 dark:text-blue-400 inline-block truncate ${
                    hasUnreadMessages ? "font-semibold text-gray-900 dark:text-gray-100" : ""
                  }`}
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {(() => {
                      // Find sender info from participants
                      const sender = conversation.participants.find(p => p._id === conversation.lastMessage.sender);
                      return `${sender?.name || sender?.username || 'Người dùng'}: `;
                    })()}
                  </span>
                  {conversation.lastMessage.content.length > 40
                    ? `${conversation.lastMessage.content.substring(0, 40)}...`
                    : conversation.lastMessage.content}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400 italic">Chưa có tin nhắn</span>
            )}

            {conversation.lastMessage && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1 flex-shrink-0">
                🕐{formatLastMessageTime(conversation.lastActivity)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handle friend selected from search to start chat
  const handleFriendSelectedForChat = async (friend) => {
    try {
      await startChatWithFriend(
        friend,
        (conversation) => {
          // If we have onCreateConversation callback, call it to add conversation to list
          if (onCreateConversation) {
            onCreateConversation(conversation);
          } else {
            // Fallback: just select the conversation
            onSelectConversation(conversation);
            // Close the search modal
            setShowUserSearch(false);
            setShowConversationSearch(true);
          }
        },
        (error) => {
          console.error("❌ Failed to start chat:", error);
          alert(error.message || "Không thể tạo cuộc trò chuyện");
          // Don't close search modal on error, user might want to try again
        }
      );
    } catch (error) {
      console.error("❌ Error in chat creation:", error);
      alert("Có lỗi xảy ra khi tạo cuộc trò chuyện");
    }
  };

  // Handle closing user search modal
  const handleCloseUserSearch = () => {
    setShowUserSearch(false);
    setShowConversationSearch(true); // Show conversation list again
  };

  const renderUserSearchResults = () => {
    return (
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={handleCloseUserSearch}
        onFriendRequestSent={(userId, username) => {
          console.log(`📤 Friend request sent to ${username} from chat search`);
          // Keep modal open, user might want to search for more people
          // But ensure conversation search is shown when they close modal
        }}
        // Custom title for chat context
        title="Tìm bạn để nhắn tin"
        showChatButton={true}
        onStartChat={handleFriendSelectedForChat}
      />
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 relative">
        <div className="p-2">
          <h4 className="text-base font-black text-gray-900 dark:text-gray-100 uppercase">Cuộc trò chuyện</h4>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-3 py-10 px-5">
          <div className="w-6 h-6 border-2 border-gray-200 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col bg-white dark:bg-gray-900 relative">
      {/* Header */}
      {showConversationSearch && (
        <div>
          {/* <div className={styles.conversationHeader}  > */}
          {/* <h4>Cuộc trò chuyện</h4> */}
          <button
            className="fixed bottom-4 right-6 rounded-full flex items-center justify-center p-0 m-0" style={{display: "flex",}}
            onClick={() => {
              setShowUserSearch(true);
              setShowConversationSearch(false);
            }}
            title="Tạo cuộc trò chuyện mới"
          >
            <img src={Plus} width={50} alt="" />
          </button>
          {/* </div> */}

          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm outline-none bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:shadow-md focus:bg-white dark:focus:bg-gray-600"
            />
          </div>
        </div>
      )}

      {/* User Search Modal */}
      {showUserSearch && renderUserSearchResults()}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(renderConversationItem)
        ) : conversations.length > 0 ? (
          <div className="py-10 px-5 text-center">
            <span className="text-gray-500 dark:text-gray-400">Không tìm thấy cuộc trò chuyện nào</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-5 items-center justify-center text-center text-gray-500 dark:text-gray-400 py-10 px-5">
            <div className="text-5xl mb-4 opacity-50">💬</div>
            <h4 className="m-0 text-gray-900 dark:text-gray-100 text-base font-bold">Chưa có cuộc trò chuyện</h4>
            <p className="m-0 text-sm leading-relaxed max-w-[200px]">Bắt đầu cuộc trò chuyện mới bằng cách nhấn nút + ở trên</p>
          </div>
        )}
      </div>

      {/* Online Users Count */}
      {onlineUsers.size > 0 && (
        <div className="py-2 px-5 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">{onlineUsers.size} người đang hoạt động</span>
        </div>
      )}
    </div>
  );
};

ConversationList.propTypes = {
  conversations: PropTypes.array.isRequired,
  activeConversation: PropTypes.object,
  onSelectConversation: PropTypes.func.isRequired,
  onCreateConversation: PropTypes.func,
  onlineUsers: PropTypes.object,
  loading: PropTypes.bool,
};

export default ConversationList;
