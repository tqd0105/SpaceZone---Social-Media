// useChat.js - Custom hook for chat functionality
import { useContext } from 'react';
import { ChatContext } from '../context/ChatProvider';

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};