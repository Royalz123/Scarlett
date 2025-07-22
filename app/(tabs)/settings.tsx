import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Switch, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Key, Trash2, Info, Heart, CreditCard, Volume2, VolumeX, Lock, LogOut } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useChatStore from '@/store/chat-store';
import useSubscriptionStore from '@/store/subscription-store';
import useVoiceStore from '@/store/voice-store';
import useAuthStore from '@/store/auth-store';
import ApiKeyModal from '@/components/ApiKeyModal';
import PasswordVerificationModal from '@/components/PasswordVerificationModal';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { apiKey, clearChat } = useChatStore();
  const { 
    subscriptionValid, 
    subscriptionStartDate,
    resetMessageCount,
    setSubscription,
    passwordVerified,
    passwordProtected
  } = useSubscriptionStore();
  const {
    voiceEnabled,
    autoPlayEnabled,
    voiceApiKey,
    toggleVoice,
    toggleAutoPlay,
    setVoiceApiKey
  } = useVoiceStore();
  const { logout, isAuthenticated } = useAuthStore();
  
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [showVoiceApiInput, setShowVoiceApiInput] = useState(false);
  const [voiceApiKeyInput, setVoiceApiKeyInput] = useState(voiceApiKey || '');
  
  const router = useRouter();
  
  const handleClearChat = () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to clear all messages and reset your subscription? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive", 
          onPress: () => {
            clearChat();
            resetMessageCount(); // Reset message count for subscription tracking
            setSubscription(false, null); // Reset subscription status
          }
        }
      ]
    );
  };
  
  const handleGoToSubscription = () => {
    router.push('/subscription');
  };
  
  const handleSaveVoiceApiKey = () => {
    setVoiceApiKey(voiceApiKeyInput.trim());
    setShowVoiceApiInput(false);
  };
  
  const handleVerifyPassword = () => {
    setPasswordModalVisible(true);
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? You'll need to enter the password again to access the app.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };
  
  // Format the expiration date
  const getExpirationDate = () => {
    if (!subscriptionStartDate) return "Not subscribed";
    
    const startDate = new Date(subscriptionStartDate);
    const expirationDate = new Date(startDate);
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    return expirationDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Don't render content until authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API KEY</Text>
          <Pressable 
            style={styles.settingItem} 
            onPress={() => setApiKeyModalVisible(true)}
          >
            <View style={styles.settingIconContainer}>
              <Key size={20} color={Colors.dark.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>API Key</Text>
              <Text style={styles.settingDescription}>
                {apiKey ? "API key is set" : "Set your API key"}
              </Text>
            </View>
          </Pressable>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
          <Pressable style={styles.settingItem} onPress={handleGoToSubscription}>
            <View style={styles.settingIconContainer}>
              <CreditCard size={20} color={Colors.dark.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Subscription Status</Text>
              <Text style={styles.settingDescription}>
                {subscriptionValid 
                  ? `Active until ${getExpirationDate()}${passwordVerified ? " (Verified)" : ""}` 
                  : "No active subscription"}
              </Text>
            </View>
          </Pressable>
          
          {subscriptionValid && passwordProtected && !passwordVerified && (
            <Pressable 
              style={styles.settingItem} 
              onPress={handleVerifyPassword}
            >
              <View style={styles.settingIconContainer}>
                <Lock size={20} color={Colors.dark.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Verify Subscription</Text>
                <Text style={styles.settingDescription}>
                  Enter your subscription password
                </Text>
              </View>
            </Pressable>
          )}
        </View>
        
        {Platform.OS !== 'web' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>VOICE</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                {voiceEnabled ? (
                  <Volume2 size={20} color={Colors.dark.primary} />
                ) : (
                  <VolumeX size={20} color={Colors.dark.primary} />
                )}
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Voice Messages</Text>
                <Text style={styles.settingDescription}>
                  {voiceEnabled ? "Scarlett will speak her messages" : "Voice messages are disabled"}
                </Text>
              </View>
              <Switch
                value={voiceEnabled}
                onValueChange={toggleVoice}
                trackColor={{ false: '#333', true: Colors.dark.primary }}
                thumbColor="#fff"
              />
            </View>
            
            {voiceEnabled && (
              <View style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Volume2 size={20} color={Colors.dark.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Auto-Play Voice</Text>
                  <Text style={styles.settingDescription}>
                    {autoPlayEnabled ? "Automatically play Scarlett's voice" : "Manual voice playback"}
                  </Text>
                </View>
                <Switch
                  value={autoPlayEnabled}
                  onValueChange={toggleAutoPlay}
                  trackColor={{ false: '#333', true: Colors.dark.primary }}
                  thumbColor="#fff"
                />
              </View>
            )}
            
            {voiceEnabled && (
              <Pressable 
                style={styles.settingItem} 
                onPress={() => setShowVoiceApiInput(!showVoiceApiInput)}
              >
                <View style={styles.settingIconContainer}>
                  <Key size={20} color={Colors.dark.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>ElevenLabs API Key</Text>
                  <Text style={styles.settingDescription}>
                    {voiceApiKey ? "API key is set" : "Set your ElevenLabs API key"}
                  </Text>
                </View>
              </Pressable>
            )}
            
            {voiceEnabled && showVoiceApiInput && (
              <View style={styles.apiInputContainer}>
                <TextInput
                  style={styles.apiInput}
                  placeholder="Enter ElevenLabs API key"
                  placeholderTextColor={Colors.dark.subtext}
                  value={voiceApiKeyInput}
                  onChangeText={setVoiceApiKeyInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={Platform.OS !== 'web'}
                />
                <Pressable style={styles.apiSaveButton} onPress={handleSaveVoiceApiKey}>
                  <Text style={styles.apiSaveButtonText}>Save</Text>
                </Pressable>
              </View>
            )}
            
            {voiceEnabled && (
              <View style={styles.voiceInfoBox}>
                <Text style={styles.voiceInfoTitle}>About Voice Messages</Text>
                <Text style={styles.voiceInfoText}>
                  Voice messages use ElevenLabs for text-to-speech with the Bella voice - a passionate, sexy female voice.
                </Text>
                <Text style={styles.voiceInfoText}>
                  Get a free API key at elevenlabs.io. The free tier includes 10,000 characters per month.
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CHAT</Text>
          <Pressable style={styles.settingItem} onPress={handleClearChat}>
            <View style={styles.settingIconContainer}>
              <Trash2 size={20} color={Colors.dark.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Clear Chat History</Text>
              <Text style={styles.settingDescription}>
                Delete all messages and reset subscription
              </Text>
            </View>
          </Pressable>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          <Pressable style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingIconContainer}>
              <LogOut size={20} color={Colors.dark.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Logout</Text>
              <Text style={styles.settingDescription}>
                Lock the app and require password to access again
              </Text>
            </View>
          </Pressable>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Info size={20} color={Colors.dark.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Scarlett AI</Text>
              <Text style={styles.settingDescription}>
                Version 1.0.0
              </Text>
            </View>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Scarlett AI uses the API to connect to the gryphe/mythomax-l2-13b model.
              Your API key is stored only on your device and is never sent to our servers.
            </Text>
            <Text style={styles.infoText}>
              To get an API key, visit openrouter.ai and create an account.
            </Text>
          </View>
          
          <View style={styles.madeWithLove}>
            <Heart size={16} color={Colors.dark.primary} />
            <Text style={styles.madeWithLoveText}>
              Made with love from Scarlett AI
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <ApiKeyModal
        visible={apiKeyModalVisible}
        onClose={() => setApiKeyModalVisible(false)}
      />
      
      <PasswordVerificationModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: Colors.dark.card,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 64, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  infoBox: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
    lineHeight: 20,
  },
  madeWithLove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
    gap: 8,
  },
  madeWithLoveText: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  apiInputContainer: {
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  apiInput: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  apiSaveButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  apiSaveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  voiceInfoBox: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 64, 129, 0.1)',
    borderRadius: 12,
  },
  voiceInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  voiceInfoText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
    lineHeight: 20,
  }
});