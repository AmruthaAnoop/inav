import React from 'react';
import { ToastProvider } from './src/context/ToastContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider as RNToastProvider } from 'react-native-toast-notifications';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RNToastProvider>
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </RNToastProvider>
    </GestureHandlerRootView>
  );
}
