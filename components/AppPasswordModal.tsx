import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, Image } from 'react-native';
import { Lock, X, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useAuthStore from '@/store/auth-store';

interface AppPasswordModalProps {
  visible: boolean;
}

const AppPasswordModal: React.FC<AppPasswordModalProps> = ({ visible }) => {
  const { authenticate } = useAuthStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleVerify = () => {
    if (!password.trim()) {
      setError('Please enter the app password');
      return;
    }
    
    const isCorrect = authenticate(password.trim());
    
    if (isCorrect) {
      setSuccess(true);
      setError('');
      
      // Modal will be closed automatically by the auth store
    } else {
      setError('Incorrect password. Please try again.');
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {success ? (
            <View style={styles.successContainer}>
              <CheckCircle size={48} color={Colors.dark.primary} />
              <Text style={styles.successText}>Access granted!</Text>
              <Text style={styles.successSubtext}>Welcome to Scarlett AI</Text>
            </View>
          ) : (
            <>
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1743987508794-aaee8929ea82?q=80&w=200&auto=format&fit=crop" }}
                  style={styles.logo}
                />
                <Text style={styles.appName}>Scarlett AI</Text>
              </View>
              
              <Text style={styles.description}>
                Enter password to access Scarlett AI
              </Text>
              
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.dark.subtext} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={Colors.dark.subtext}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  onSubmitEditing={handleVerify}
                />
              </View>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <Pressable style={styles.verifyButton} onPress={handleVerify}>
                <Text style={styles.verifyButtonText}>Access App</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  description: {
    color: Colors.dark.subtext,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  errorText: {
    color: Colors.dark.error,
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
  },
});

export default AppPasswordModal;