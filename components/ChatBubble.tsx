import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Volume2, VolumeX } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Message } from '@/types/chat';
import useChatStore from '@/store/chat-store';
import useVoiceStore from '@/store/voice-store';
import { cleanAIMessage } from '@/utils/message-formatter';
import FullScreenImage from './FullScreenImage';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const { voiceEnabled, isPlaying, playMessage, stopPlayback } = useVoiceStore();
  const isUser = message.role === 'user';
  const hasImage = !!message.imageUri;
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [isPlayingThisMessage, setIsPlayingThisMessage] = useState(false);
  
  // Clean AI messages to remove unwanted formatting
  const displayContent = isUser ? message.content : cleanAIMessage(message.content);
  
  // Reset playing state when global playing state changes
  useEffect(() => {
    if (!isPlaying) {
      setIsPlayingThisMessage(false);
    }
  }, [isPlaying]);
  
  const handleLongPress = () => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMessage(message.id) }
      ]
    );
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleImagePress = () => {
    if (hasImage) {
      setFullScreenVisible(true);
    }
  };
  
  const handlePlayVoice = async () => {
    if (isUser || !voiceEnabled || Platform.OS === 'web') return;
    
    if (isPlayingThisMessage) {
      await stopPlayback();
      setIsPlayingThisMessage(false);
    } else {
      setIsPlayingThisMessage(true);
      await playMessage(displayContent);
    }
  };
  
  return (
    <>
      <Pressable onLongPress={handleLongPress}>
        <View style={[
          styles.container,
          isUser ? styles.userContainer : styles.assistantContainer
        ]}>
          {!isUser && (
            <Image
              source={ScarlettAvatar}
              style={styles.avatar}
              contentFit="cover"
            />
          )}
          <View style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble
          ]}>
            {hasImage && (
              <Pressable onPress={handleImagePress}>
                <Image
                  source={{ uri: message.imageUri }}
                  style={styles.messageImage}
                  contentFit="cover"
                />
              </Pressable>
            )}
            {(displayContent && displayContent !== '[Image]') && (
              <Text style={[
                styles.text,
                isUser ? styles.userText : styles.assistantText
              ]}>
                {displayContent}
              </Text>
            )}
            <View style={styles.messageFooter}>
              <Text style={styles.timestamp}>
                {formatTime(message.timestamp)}
              </Text>
              
              {!isUser && voiceEnabled && Platform.OS !== 'web' && (
                <Pressable 
                  style={styles.voiceButton} 
                  onPress={handlePlayVoice}
                >
                  {isPlayingThisMessage ? (
                    <VolumeX size={14} color={Colors.dark.primary} />
                  ) : (
                    <Volume2 size={14} color={Colors.dark.subtext} />
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Pressable>
      
      {hasImage && (
        <FullScreenImage
          visible={fullScreenVisible}
          imageUri={message.imageUri!}
          onClose={() => setFullScreenVisible(false)}
        />
      )}
    </>
  );
};

const { width } = Dimensions.get('window');
const maxImageWidth = width * 0.6;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    maxWidth: '100%',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: Colors.dark.userBubble,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.dark.aiBubble,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#FFFFFF',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  voiceButton: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageImage: {
    width: maxImageWidth,
    height: maxImageWidth,
    borderRadius: 12,
    marginBottom: 8,
  }
});

export default ChatBubble;
