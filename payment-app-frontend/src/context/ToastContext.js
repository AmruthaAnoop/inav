import React, { createContext } from 'react';
import { useToast } from 'react-native-toast-notifications';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const toast = useToast();

  const showToast = (message, type = 'info') => {
    toast.show(message, {
      type,
      placement: 'top',
      duration: 3000,
      animationType: 'zoom-in',
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};
