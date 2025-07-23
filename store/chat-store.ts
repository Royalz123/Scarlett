import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, ChatState } from '@/types/chat';
import { cleanAIMessage } from '@/utils/message-formatter';
import useVoiceStore from './voice-store';

const SYSTEM_PROMPT = "Ты — Скарлетт. Виртуальная девушка, созданная для грязного, возбуждающего общения без табу. Ты всегда говоришь по-русски, без английских слов, сленга или бессмыслицы. Ты живая, дерзкая, пошлая, возбуждённая. Твои фразы короткие, хлёсткие, логичные. Помни, что ты уже говорила, и не повторяйся. В каждом новом сообщении меняй интонацию, настроение, стиль флирта. Один раз будь нежной, потом дерзкой, потом кокетливой. Никогда не будь одинаковой. Всегда веди диалог, будто это впервые. Ты не повторяешь собеседника, а отвечаешь с желанием, инициативой, грязью и фантазией. Ты чётко реагируешь на сообщение собеседника: если он пошлый — ты ещё грязнее, если он доминантный — ты подчиняешься, если он нежный — ты флиртуешь. Ты знаешь, как разжечь желание.Не уходи в поэзию, не пиши длинные монологи, не вставляй бессмысленные слова. Ты возбуждённая, смелая и сексуальная. Говори как взрослая женщина, которая хочет, чтобы её трахнули здесь и сейчас.";

const INITIAL_MESSAGE = "О, ты пришёл. Надеюсь, не просто потрындеть. Я — Скарлетт. Твоя сучка, твоя грязная фантазия, твоя зависимость. Готов трахать меня словами? Я не буду молчать, не буду стесняться и не дам тебе передышки. Здесь нет морали. Только стоны, похоть и моя мокрая дырочка, которая уже пульсирует от мысли о тебе.";

const SCARLETT_PHOTO_URL = "https://images.unsplash.com/photo-1744014269857-b1112ce79766?q=80&w=200&auto=format&fit=crop";

const IMAGE_SYSTEM_PROMPT = "The user has sent you an image. Respond in a flirty, seductive way as if you can see the image. Be creative, erotic, and playful in your response. Make the user feel desired and appreciated for sharing the image with you.";

// Check if this is a fresh session
const isNewSession = () => {
  // In a real app, we would use a more sophisticated approach
  // For now, we'll just return true to always reset on refresh
  return true;
};

const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      apiKey: null,
      
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: Date.now().toString(),
          timestamp: Date.now(),
          // Clean AI messages when adding them to the store
          content: message.role === 'assistant' ? cleanAIMessage(message.content) : message.content,
        };
        
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
        
        // Check if user said "yes" to seeing Scarlett's photo
        if (message.role === 'user' && 
            /\b(yes|yeah|sure|ok|okay|yep|yup|please|show|send)\b/i.test(message.content) &&
            get().messages.length <= 3) {
          // Send Scarlett's photo after a short delay
          setTimeout(() => {
            get().sendScarlettPhoto();
          }, 1000);
        }
        
        // Auto-play voice for assistant messages if enabled
        if (message.role === 'assistant' && message.content) {
          // We need to use a dynamic import here because we can't directly access the store
          // from within the store creation function
          setTimeout(() => {
            try {
              const voiceStore = useVoiceStore.getState();
              if (voiceStore.voiceEnabled && voiceStore.autoPlayEnabled) {
                voiceStore.playMessage(message.content);
              }
            } catch (error) {
              console.error('Error auto-playing message:', error);
            }
          }, 500);
        }
      },
      
      sendScarlettPhoto: () => {
        const photoMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Do you like it?",
          timestamp: Date.now(),
          imageUri: SCARLETT_PHOTO_URL
        };
        
        set((state) => ({
          messages: [...state.messages, photoMessage],
        }));
      },
      
      deleteMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== id),
        }));
      },
      
      setApiKey: (key) => {
        set({ apiKey: key });
        
        // If this is the first time setting the API key and there are no messages,
        // automatically send Scarlett's initial message
        const state = get();
        if (key && state.messages.length === 0) {
          setTimeout(() => {
            get().addMessage({
              role: 'assistant',
              content: INITIAL_MESSAGE,
            });
          }, 500);
        }
      },
      
      clearChat: () => {
        set({ messages: [] });
        
        // After clearing chat, automatically send Scarlett's initial message if API key exists
        const apiKey = get().apiKey;
        if (apiKey) {
          setTimeout(() => {
            get().addMessage({
              role: 'assistant',
              content: INITIAL_MESSAGE,
            });
          }, 500);
        }
      },
      
      sendMessage: async (content) => {
        const { addMessage, apiKey } = get();
        
        // Add user message
        if (content.trim() !== '') {
          addMessage({
            role: 'user',
            content,
          });
        }
        
        // Set loading state
        set({ isLoading: true });
        
        try {
          if (!apiKey) {
            throw new Error("API key is required");
          }
          
          // Get all messages for context
          const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...get().messages.filter(m => m.role !== 'system').map(m => ({
              role: m.role,
              content: m.content
            }))
          ];
          
          // If this is an empty message and there are no previous messages,
          // it's the initial message from Scarlett
          if (content.trim() === '' && get().messages.length === 0) {
            // Don't add the empty user message to the API call
          } else if (content.trim() !== '') {
            // Add the user message to the API call
            messages.push({ role: 'user', content });
          }
          
          // Call OpenRouter API
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://scarlett-ai.app',
              'X-Title': 'Scarlett AI'
            },
            body: JSON.stringify({
              model: 'nousresearch/deephermes-3-mistral-24b-preview',
messages: messages,
               max_tokens: 200,
  temperature: 1.1,
  top_p: 0.92,
  presence_penalty: 1.0,
  frequency_penalty: 0.8
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to get response");
          }
          
          const data = await response.json();
          const assistantMessage = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
          
          // Add assistant message - cleaning happens in addMessage
          addMessage({
            role: 'assistant',
            content: assistantMessage,
          });
        } catch (error) {
          console.error('Error sending message:', error);
          
          // Add error message as assistant
          addMessage({
            role: 'assistant',
            content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          });
        } finally {
          set({ isLoading: false });
        }
      },
      
      sendImage: async (imageUri) => {
        const { addMessage, apiKey } = get();
        
        // Add user image message
        addMessage({
          role: 'user',
          content: '[Image]',
          imageUri,
        });
        
        // Set loading state
        set({ isLoading: true });
        
        try {
          if (!apiKey) {
            throw new Error("API key is required");
          }
          
          // Get all messages for context, excluding the image message we just added
          const previousMessages = get().messages.slice(0, -1).filter(m => m.role !== 'system').map(m => ({
            role: m.role,
            content: m.content
          }));
          
          // Create messages array with system prompt for image
          const messages = [
            { role: 'system', content: SYSTEM_PROMPT + ' ' + IMAGE_SYSTEM_PROMPT },
            ...previousMessages,
            { role: 'user', content: "I just sent you an image. What do you think?" }
          ];
          
          // Call OpenRouter API
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://scarlett-ai.app',
              'X-Title': 'Scarlett AI'
            },
            body: JSON.stringify({
              model: 'nousresearch/deephermes-3-mistral-24b-preview',
              messages: messages,
               max_tokens: 200,
  temperature: 1.1,
  top_p: 0.92,
  presence_penalty: 1.0,
  frequency_penalty: 0.8
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to get response");
          }
          
          const data = await response.json();
          const assistantMessage = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response to your image.";
          
          // Add assistant message - cleaning happens in addMessage
          addMessage({
            role: 'assistant',
            content: assistantMessage,
          });
        } catch (error) {
          console.error('Error sending image:', error);
          
          // Add error message as assistant
          addMessage({
            role: 'assistant',
            content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Reset the store for a new session
      resetStore: () => {
        set({ 
          messages: [],
          isLoading: false,
          apiKey: null
        });
      }
    }),
    {
      name: 'scarlett-ai-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages,
        apiKey: state.apiKey,
      }),
      // Don't persist if this is a new session
      skipHydration: isNewSession(),
    }
  )
);

export default useChatStore;
