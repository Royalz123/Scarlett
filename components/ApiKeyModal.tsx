import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { X, Key, Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useChatStore from '@/store/chat-store';
import useSubscriptionStore from '@/store/subscription-store';

interface ApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ visible, onClose }) => {
  const { apiKey, setApiKey } = useChatStore();
  const { verifyPassword } = useSubscriptionStore();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(true); // Always show password field
  
  const handleSave = () => {
    setApiKey(inputKey.trim());
    
    // If password is entered, verify it
    if (password.trim()) {
      verifyPassword(password.trim());
    }
    
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>API Key</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.dark.text} />
            </Pressable>
          </View>
          
          <Text style={styles.description}>
            Enter your API key to use Scarlett AI. You can get a free API key at openrouter.ai
          </Text>
          
          <View style={styles.inputContainer}>
            <Key size={20} color={Colors.dark.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="sk-or-..."
              placeholderTextColor={Colors.dark.subtext}
              value={inputKey}
              onChangeText={setInputKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={Platform.OS !== 'web'}
            />
          </View>
          
          {/* Password field - always shown */}
          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.dark.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter subscription password"
              placeholderTextColor={Colors.dark.subtext}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>
          
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save API Key</Text>
          </Pressable>
          
          <Text style={styles.disclaimer}>
            Your API key is stored only on your device and is never sent to our servers.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 4,
  },
  description: {
    color: Colors.dark.subtext,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disclaimer: {
    color: Colors.dark.subtext,
    fontSize: 12,
    textAlign: 'center',
  },
  passwordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  passwordToggleText: {
    color: Colors.dark.primary,
    fontSize: 14,
  },
});

export default ApiKeyModal;