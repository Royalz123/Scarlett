import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, ActivityIndicator, Platform, Text } from 'react-native';
import { Send, Image as ImageIcon, Lock } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import useChatStore from '@/store/chat-store';
import useSubscriptionStore from '@/store/subscription-store';

interface ChatInputProps {
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ disabled = false }) => {
  const [message, setMessage] = useState('');
  const { sendMessage, sendImage, isLoading } = useChatStore();
  const { incrementMessageCount, showSubscriptionModal } = useSubscriptionStore();
  
  const handleSend = async () => {
    if (message.trim() === '' || isLoading || disabled) return;
    
    if (disabled) {
      showSubscriptionModal();
      return;
    }
    
    const trimmedMessage = message.trim();
    setMessage('');
    
    // Increment message count for subscription tracking
    incrementMessageCount();
    
    await sendMessage(trimmedMessage);
  };
  
  const handleImagePick = async () => {
    if (isLoading || disabled) return;
    
    if (disabled) {
      showSubscriptionModal();
      return;
    }
    
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Increment message count for subscription tracking
        incrementMessageCount();
        
        await sendImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image. Please try again.');
    }
  };
  
  if (disabled) {
    return (
      <Pressable 
        style={styles.disabledContainer}
        onPress={showSubscriptionModal}
      >
        <Lock size={20} color={Colors.dark.text} />
        <Text style={styles.disabledText}>
          You've reached your free message limit. Subscribe to continue.
        </Text>
      </Pressable>
    );
  }
  
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.imageButton}
        onPress={handleImagePick}
        disabled={isLoading}
      >
        <ImageIcon size={24} color={Colors.dark.text} />
      </Pressable>
      
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor={Colors.dark.subtext}
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={1000}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        blurOnSubmit={false}
      />
      
      <Pressable
        style={styles.sendButton}
        onPress={handleSend}
        disabled={isLoading || message.trim() === ''}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Send size={24} color="#FFFFFF" />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.dark.card,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  disabledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 64, 129, 0.1)',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    gap: 12,
    justifyContent: 'center',
  },
  disabledText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.dark.text,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButton: {
    marginRight: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatInput;