import { useState } from "react";
import PropTypes from "prop-types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import styles from "./ConversationList.module.scss";
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
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true, locale: vi });
      } else {
        return date.toLocaleDateString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(" ", " • ");
      }
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
        className={`${styles.conversationItem} ${
          isActive ? styles.active : ""
        }`}
        onClick={() => onSelectConversation(conversation)}
      >
        {/* Avatar */}
        <div className={styles.avatarContainer}>
          <img
            src={avatarUrl}
            alt={otherParticipant?.name || otherParticipant?.username || "User"}
            className={styles.avatar}
            onError={(e) => {
              e.target.src = defaultAvatar;
            }}
          />
          {hasUnreadMessages && (
              <div className={styles.unreadBadge}>
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </div>
            )}
          {isOnline && <div className={styles.onlineIndicator}></div>}
        </div>

        {/* Conversation Info */}
        <div className={styles.conversationInfo}>
          <div className={styles.conversationHeader}>
            <div className="flex items-center justify-start gap-1">
            {/* Friendship Status Indicator */}
            {conversation.friendshipStatus && (
              <div
                className={`${styles.friendshipStatus} ${
                  styles[`friendshipStatus--${conversation.friendshipStatus}`]
                }`}
              >
                {conversation.friendshipStatus === "accepted" && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
                {conversation.friendshipStatus === "pending" && "⏳"}
                {conversation.friendshipStatus === "blocked" && "🚫"}
                {conversation.friendshipStatus === "none" && "⚠️"}
              </div>
            )}

            <span className={styles.participantName}>
              {otherParticipant?.name ||
                otherParticipant?.username ||
                "Người dùng"}
            </span>
            </div>

            {conversation.lastMessage && (
              <span className={styles.lastMessageTime}>
                🕐{formatLastMessageTime(conversation.lastActivity)}
              </span>
            )}
          </div>

          <div className={styles.conversationPreview}>
            {conversation.lastMessage ? (
              <div className={styles.lastMessage}>
                <span
                  className={`${styles.messageText} ${
                    hasUnreadMessages ? styles.unread : ""
                  }`}
                >
                  {conversation.lastMessage.content.length > 50
                    ? `${conversation.lastMessage.content.substring(0, 50)}...`
                    : conversation.lastMessage.content}
                </span>
              </div>
            ) : (
              <span className={styles.noMessages}>Chưa có tin nhắn</span>
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
      <div className={styles.conversationList}>
        <div className={styles.conversationHeader}>
          <h4>Cuộc trò chuyện</h4>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.conversationList}>
      {/* Header */}
      {showConversationSearch && (
        <div>
          {/* <div className={styles.conversationHeader}  > */}
          {/* <h4>Cuộc trò chuyện</h4> */}
          <button
            className={styles.newChatButton}
            className=" absolute bottom-4 right-6 rounded-full flex items-center justify-center p-0 m-0"
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
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      )}

      {/* User Search Modal */}
      {showUserSearch && renderUserSearchResults()}

      {/* Conversations List */}
      <div className={styles.conversationsContainer}>
        {filteredConversations.length > 0 ? (
          filteredConversations.map(renderConversationItem)
        ) : conversations.length > 0 ? (
          <div className={styles.noResults}>
            <span>Không tìm thấy cuộc trò chuyện nào</span>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <h4>Chưa có cuộc trò chuyện</h4>
            <p>Bắt đầu cuộc trò chuyện mới bằng cách nhấn nút + ở trên</p>
          </div>
        )}
      </div>

      {/* Online Users Count */}
      {onlineUsers.size > 0 && (
        <div className={styles.onlineUsersCount}>
          <span>{onlineUsers.size} người đang hoạt động</span>
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
