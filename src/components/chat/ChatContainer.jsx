// ChatContainer.jsx - Chat container for Header integration
import { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatWindow from './ChatWindow';

const ChatContainer = () => {
  try {
    const { isChatOpen, toggleChat } = useChat();
    

    if (!isChatOpen) {
      return null;
    }

    return (
      <div className="fixed bottom-0 right-4 lg:right-[100px] z-50 animate__animated animate__fadeIn">
        <ChatWindow isOpen={isChatOpen} onClose={toggleChat} />
      </div>
    );
  } catch (error) {
    console.error('❌ [ChatContainer] Error:', error);
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded">
        Chat Error: {error.message}
      </div>
    );
  }
};

export default ChatContainer;