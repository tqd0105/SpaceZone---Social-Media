// CallContext.jsx - Context để share call state giữa các components
import { createContext, useContext } from 'react';
import { useCall } from '../hooks/useCall';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const callState = useCall();
  
  return (
    <CallContext.Provider value={callState}>
      {children}
    </CallContext.Provider>
  );
};

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCallContext must be used within a CallProvider');
  }
  return context;
};