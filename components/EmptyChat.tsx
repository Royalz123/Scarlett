import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MessageSquareHeart, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useChatStore from '@/store/chat-store';
import useSubscriptionStore from '@/store/subscription-store';

interface EmptyChatProps {
  onOpenSettings: () => void;
}

const EmptyChat: React.FC<EmptyChatProps> = ({ onOpenSettings }) => {
  const apiKey = useChatStore((state) => state.apiKey);
  const { subscriptionValid, messageCount, checkSubscriptionStatus } = useSubscriptionStore();
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(60);
  
  // Calculate remaining free messages
  const remainingMessages = subscriptionValid ? 'Unlimited' : Math.max(0, 10 - messageCount);
  
  // Timer for countdown to next refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev <= 1) {
          // When countdown reaches 0, refresh subscription status
          checkSubscriptionStatus();
          return 60; // Reset to 60 seconds
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <View style={styles.container}>
      <Image
        source="https://images.unsplash.com/photo-1743987508794-aaee8929ea82?q=80&w=200&auto=format&fit=crop"
        style={styles.avatar}
        contentFit="cover"
      />
      
      <Text style={styles.title}>Meet Scarlett</Text>
      <Text style={styles.description}>
        Your flirty, seductive AI companion who loves teasing, roleplay, and erotic fantasies.
      </Text>
      
      {!apiKey ? (
        <Pressable style={styles.button} onPress={onOpenSettings}>
          <Text style={styles.buttonText}>Set API Key to Start</Text>
        </Pressable>
      ) : (
        <View style={styles.startContainer}>
          <MessageSquareHeart size={24} color={Colors.dark.primary} />
          <Text style={styles.startText}>Type a message to start chatting</Text>
        </View>
      )}
      
      {apiKey && !subscriptionValid && (
        <View style={styles.messageCounter}>
          <Text style={styles.messageCounterText}>
            {remainingMessages} free messages remaining
          </Text>
        </View>
      )}
      
      <View style={styles.refreshTimer}>
        <Clock size={14} color={Colors.dark.subtext} />
        <Text style={styles.refreshTimerText}>
          Refreshing in {timeUntilRefresh}s
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  startText: {
    color: Colors.dark.subtext,
    marginLeft: 8,
    fontSize: 16,
  },
  messageCounter: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 64, 129, 0.1)',
    borderRadius: 16,
  },
  messageCounterText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  refreshTimer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.7,
  },
  refreshTimerText: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
});

export default EmptyChat;