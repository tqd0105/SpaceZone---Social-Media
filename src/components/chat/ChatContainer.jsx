// ChatContainer.jsx - Chat container for Header integration
import { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatWindow from './ChatWindow';

const ChatContainer = () => {
  try {
    const { isChatOpen, toggleChat } = useChat();
    
    console.log('💬 [ChatContainer] Chat open state:', isChatOpen);
    console.log('💬 [ChatContainer] toggleChat function:', typeof toggleChat);

    if (!isChatOpen) {
      console.log('💬 [ChatContainer] Chat is closed, not rendering');
      return null;
    }

    console.log('💬 [ChatContainer] Chat is open, rendering ChatWindow');
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