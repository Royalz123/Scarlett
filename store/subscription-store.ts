import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionState, FREE_MESSAGE_LIMIT, SUBSCRIPTION_DAYS } from '@/types/subscription';

// Check if this is a fresh session
const isNewSession = () => {
  // In a real app, we would use a more sophisticated approach
  // For now, we'll just return true to always reset on refresh
  return true;
};

const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      messageCount: 0,
      subscriptionValid: false,
      subscriptionStartDate: null,
      isModalVisible: false,
      isProcessingPayment: false,
      passwordProtected: false,
      passwordVerified: false,
      
      incrementMessageCount: () => {
        const { messageCount, subscriptionValid } = get();
        
        // Only increment if not subscribed
        if (!subscriptionValid) {
          set({ messageCount: messageCount + 1 });
          
          // Show modal if limit reached
          if (messageCount + 1 >= FREE_MESSAGE_LIMIT) {
            set({ isModalVisible: true });
          }
        }
      },
      
      resetMessageCount: () => {
        set({ messageCount: 0 });
      },
      
      setSubscription: (valid, startDate) => {
        set({
          subscriptionValid: valid,
          subscriptionStartDate: startDate,
          isModalVisible: false,
          messageCount: 0, // Reset message count when subscription is set
          passwordProtected: valid, // Enable password protection when subscription is active
          passwordVerified: false, // Reset password verification
        });
      },
      
      checkSubscriptionStatus: () => {
        const { subscriptionStartDate } = get();
        
        if (subscriptionStartDate) {
          const startDate = new Date(subscriptionStartDate);
          const currentDate = new Date();
          
          // Calculate difference in days
          const diffTime = currentDate.getTime() - startDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // If more than SUBSCRIPTION_DAYS days have passed, subscription is invalid
          if (diffDays > SUBSCRIPTION_DAYS) {
            set({
              subscriptionValid: false,
              passwordProtected: false,
              passwordVerified: false,
              // Don't reset the start date so we can show when it expired
            });
          }
        }
      },
      
      showSubscriptionModal: () => {
        set({ isModalVisible: true });
      },
      
      hideSubscriptionModal: () => {
        set({ isModalVisible: false });
      },
      
      setProcessingPayment: (processing) => {
        set({ isProcessingPayment: processing });
      },
      
      verifyPassword: (password) => {
        const isCorrect = password === 'sai25';
        set({ passwordVerified: isCorrect });
        return isCorrect;
      },
      
      resetPasswordVerification: () => {
        set({ passwordVerified: false });
      },
      
      // Reset the store for a new session
      resetStore: () => {
        set({
          messageCount: 0,
          subscriptionValid: false,
          subscriptionStartDate: null,
          isModalVisible: false,
          isProcessingPayment: false,
          passwordProtected: false,
          passwordVerified: false,
        });
      }
    }),
    {
      name: 'scarlett-subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist if this is a new session
      skipHydration: isNewSession(),
    }
  )
);

export default useSubscriptionStore;