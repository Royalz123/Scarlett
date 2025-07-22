export interface SubscriptionState {
  messageCount: number;
  subscriptionValid: boolean;
  subscriptionStartDate: string | null;
  isModalVisible: boolean;
  isProcessingPayment: boolean;
  passwordProtected: boolean;
  passwordVerified: boolean;
  
  incrementMessageCount: () => void;
  resetMessageCount: () => void;
  setSubscription: (valid: boolean, startDate: string | null) => void;
  checkSubscriptionStatus: () => void;
  showSubscriptionModal: () => void;
  hideSubscriptionModal: () => void;
  setProcessingPayment: (processing: boolean) => void;
  verifyPassword: (password: string) => boolean;
  resetPasswordVerification: () => void;
  resetStore: () => void;
}

export const FREE_MESSAGE_LIMIT = 10;
export const SUBSCRIPTION_DAYS = 30;
export const SUBSCRIPTION_PRICE = 1;