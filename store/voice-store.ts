import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Check if this is a fresh session
const isNewSession = () => {
  // In a real app, we would use a more sophisticated approach
  // For now, we'll just return true to always reset on refresh
  return true;
};

interface VoiceState {
  voiceEnabled: boolean;
  autoPlayEnabled: boolean;
  voiceApiKey: string | null;
  voiceId: string;
  isPlaying: boolean;
  currentAudio: Audio.Sound | null;
  
  toggleVoice: () => void;
  toggleAutoPlay: () => void;
  setVoiceApiKey: (key: string) => void;
  setVoiceId: (id: string) => void;
  playMessage: (text: string) => Promise<void>;
  stopPlayback: () => Promise<void>;
  resetStore: () => void;
}

// Bella voice ID from ElevenLabs - passionate, sexy female voice
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Bella voice

const useVoiceStore = create<VoiceState>()(
  persist(
    (set, get) => ({
      voiceEnabled: false,
      autoPlayEnabled: true, // Auto-play is enabled by default
      voiceApiKey: null,
      voiceId: DEFAULT_VOICE_ID,
      isPlaying: false,
      currentAudio: null,
      
      toggleVoice: () => {
        set((state) => ({ voiceEnabled: !state.voiceEnabled }));
      },
      
      toggleAutoPlay: () => {
        set((state) => ({ autoPlayEnabled: !state.autoPlayEnabled }));
      },
      
      setVoiceApiKey: (key) => {
        set({ voiceApiKey: key });
      },
      
      setVoiceId: (id) => {
        set({ voiceId: id });
      },
      
      playMessage: async (text) => {
        const { voiceEnabled, voiceApiKey, voiceId, stopPlayback } = get();
        
        // Don't attempt to play if voice is disabled or no API key
        if (!voiceEnabled || !voiceApiKey || Platform.OS === 'web') {
          return;
        }
        
        try {
          // Stop any currently playing audio
          await stopPlayback();
          
          // Set playing state
          set({ isPlaying: true });
          
          // Call ElevenLabs API to convert text to speech
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': voiceApiKey,
            },
            body: JSON.stringify({
              text: text,
              model_id: "eleven_monolingual_v1",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              }
            })
          });
          
          if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
          }
          
          // Get audio blob from response
          const audioBlob = await response.blob();
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          const audioBase64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64data = reader.result as string;
              // Remove the data URL prefix to get just the base64 string
              const base64Audio = base64data.split(',')[1];
              resolve(base64Audio);
            };
          });
          
          const base64Audio = await audioBase64Promise;
          
          // Create a temporary URI for the audio file
          const { sound } = await Audio.Sound.createAsync(
            { uri: `data:audio/mpeg;base64,${base64Audio}` },
            { shouldPlay: true }
          );
          
          // Store the sound object
          set({ currentAudio: sound });
          
          // Listen for playback status updates
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              set({ isPlaying: false, currentAudio: null });
            }
          });
          
          // Play the audio
          await sound.playAsync();
          
        } catch (error) {
          console.error('Error playing voice message:', error);
          set({ isPlaying: false, currentAudio: null });
        }
      },
      
      stopPlayback: async () => {
        const { currentAudio } = get();
        
        if (currentAudio) {
          try {
            await currentAudio.stopAsync();
            await currentAudio.unloadAsync();
          } catch (error) {
            console.error('Error stopping audio playback:', error);
          }
        }
        
        set({ isPlaying: false, currentAudio: null });
      },
      
      // Reset the store for a new session
      resetStore: () => {
        const { stopPlayback } = get();
        stopPlayback();
        
        set({
          voiceEnabled: false,
          autoPlayEnabled: true,
          voiceApiKey: null,
          voiceId: DEFAULT_VOICE_ID,
          isPlaying: false,
          currentAudio: null,
        });
      }
    }),
    {
      name: 'scarlett-voice-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        voiceEnabled: state.voiceEnabled,
        autoPlayEnabled: state.autoPlayEnabled,
        voiceApiKey: state.voiceApiKey,
        voiceId: state.voiceId,
      }),
      // Don't persist if this is a new session
      skipHydration: isNewSession(),
    }
  )
);

export default useVoiceStore;