import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState } from '@/types/auth';

// The app password
const APP_PASSWORD = 'sai25';

// Check if this is a fresh session
const isNewSession = () => {
  // In a real app, we would use a more sophisticated approach
  // For now, we'll just return true to always reset on refresh
  return true;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isAuthModalVisible: false,
      
      authenticate: (password) => {
        const isCorrect = password === APP_PASSWORD;
        if (isCorrect) {
          set({ isAuthenticated: true, isAuthModalVisible: false });
        }
        return isCorrect;
      },
      
      showAuthModal: () => {
        set({ isAuthModalVisible: true });
      },
      
      hideAuthModal: () => {
        set({ isAuthModalVisible: false });
      },
      
      logout: () => {
        set({ isAuthenticated: false });
      },
      
      // Reset the store for a new session
      resetStore: () => {
        set({
          isAuthenticated: false,
          isAuthModalVisible: false,
        });
      }
    }),
    {
      name: 'scarlett-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist if this is a new session
      skipHydration: isNewSession(),
    }
  )
);

export default useAuthStore;