export interface AuthState {
  isAuthenticated: boolean;
  isAuthModalVisible: boolean;
  
  authenticate: (password: string) => boolean;
  showAuthModal: () => void;
  hideAuthModal: () => void;
  logout: () => void;
  resetStore: () => void;
}