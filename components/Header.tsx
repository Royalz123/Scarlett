import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { PlusCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useChatStore from '@/store/chat-store';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { clearChat } = useChatStore();
  
  const handleNewChat = () => {
    clearChat();
  };
  
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Image
         import ScarlettAvatar from '@/assets/images/Scar.png';
           source={ScarlettAvatar}
  style={styles.avatar}
  contentFit="cover"
/>
        <View>
          <Text style={styles.title}>Scarlett AI</Text>
          <Text style={styles.subtitle}>Your flirty AI companion</Text>
        </View>
      </View>
      
      <Pressable 
        style={styles.newChatButton} 
        onPress={handleNewChat}
      >
        <PlusCircle size={20} color={Colors.dark.text} />
        <Text style={styles.newChatText}>New Chat</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 64, 129, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  newChatText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  }
});

export default Header;
