import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import useChatStore from '@/store/chat-store';
import useSubscriptionStore from '@/store/subscription-store';
import useAuthStore from '@/store/auth-store';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';
import Header from '@/components/Header';
import ApiKeyModal from '@/components/ApiKeyModal';
import SubscriptionModal from '@/components/SubscriptionModal';
import PasswordVerificationModal from '@/components/PasswordVerificationModal';
import EmptyChat from '@/components/EmptyChat';
import { Message } from '@/types/chat';
import { useRouter } from 'expo-router';

// Auto-refresh interval in milliseconds (1 minute)
const AUTO_REFRESH_INTERVAL = 60000;

export default function ChatScreen() {
  const { messages, apiKey, sendMessage } = useChatStore();
  const { 
    subscriptionValid, 
    messageCount, 
    isModalVisible: isSubscriptionModalVisible,
    checkSubscriptionStatus,
    passwordProtected,
    passwordVerified
  } = useSubscriptionStore();
  const { isAuthenticated } = useAuthStore();
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  const router = useRouter();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up auto-refresh timer
  useEffect(() => {
    // Initial check
    checkSubscriptionStatus();
    
    // Set up timer for periodic refresh
    refreshTimerRef.current = setInterval(() => {
      console.log('Auto-refreshing subscription status...');
      checkSubscriptionStatus();
    }, AUTO_REFRESH_INTERVAL);
    
    // Clean up timer on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, []);
  
  // Send initial message when chat is empty and API key is set
  useEffect(() => {
    if (messages.length === 0 && apiKey && isAuthenticated) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        sendMessage(""); // Empty message to trigger Scarlett's initial message
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length, apiKey, isAuthenticated]);
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);
  
  // Show API key modal if no API key is set and user is authenticated
  useEffect(() => {
    if (!apiKey && isAuthenticated) {
      setApiKeyModalVisible(true);
    }
  }, [apiKey, isAuthenticated]);
  
  // Show password modal if subscription is active but not verified
  useEffect(() => {
    if (apiKey && subscriptionValid && passwordProtected && !passwordVerified && isAuthenticated) {
      setPasswordModalVisible(true);
    }
  }, [apiKey, subscriptionValid, passwordProtected, passwordVerified, isAuthenticated]);
  
  const handleOpenSettings = () => {
    router.push('/settings');
  };
  
  const handleCloseApiKeyModal = () => {
    setApiKeyModalVisible(false);
    
    // Check if we need to show the password modal next
    if (subscriptionValid && passwordProtected && !passwordVerified) {
      setPasswordModalVisible(true);
    }
  };
  
  // Determine if chat input should be disabled
  const isChatDisabled = !subscriptionValid && messageCount >= 10;
  
  // Don't render content until authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <StatusBar style="light" />
      
      <Header onOpenSettings={handleOpenSettings} />
      
      {messages.length === 0 ? (
        <EmptyChat onOpenSettings={handleOpenSettings} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatInput disabled={isChatDisabled} />
      </KeyboardAvoidingView>
      
      <ApiKeyModal
        visible={apiKeyModalVisible}
        onClose={handleCloseApiKeyModal}
      />
      
      <PasswordVerificationModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
      
      <SubscriptionModal
        visible={isSubscriptionModalVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  chatList: {
    paddingVertical: 16,
    flexGrow: 1,
  },
});