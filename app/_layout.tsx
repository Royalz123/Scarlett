import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { ErrorBoundary } from "./error-boundary";
import useChatStore from "@/store/chat-store";
import useSubscriptionStore from "@/store/subscription-store";
import useVoiceStore from "@/store/voice-store";
import useAuthStore from "@/store/auth-store";
import AppPasswordModal from "@/components/AppPasswordModal";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({});
  const { isAuthenticated, isAuthModalVisible, showAuthModal } = useAuthStore();
  
  // Reset all stores on app load
  useEffect(() => {
    // Reset all stores to their initial state
    const chatStore = useChatStore.getState();
    const subscriptionStore = useSubscriptionStore.getState();
    const voiceStore = useVoiceStore.getState();
    const authStore = useAuthStore.getState();
    
    if (chatStore.resetStore) {
      chatStore.resetStore();
    }
    
    if (subscriptionStore.resetStore) {
      subscriptionStore.resetStore();
    }
    
    if (authStore.resetStore) {
      authStore.resetStore();
    }
  }, []);
  
  // Show auth modal on app start if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      showAuthModal();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootLayoutNav />
        <AppPasswordModal visible={isAuthModalVisible} />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.dark.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="payment-success" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}