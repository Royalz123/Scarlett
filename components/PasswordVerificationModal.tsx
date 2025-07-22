import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Lock, X, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useSubscriptionStore from '@/store/subscription-store';

interface PasswordVerificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const PasswordVerificationModal: React.FC<PasswordVerificationModalProps> = ({ visible, onClose }) => {
  const { verifyPassword, passwordVerified } = useSubscriptionStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleVerify = () => {
    if (!password.trim()) {
      setError('Please enter your subscription password');
      return;
    }
    
    const isCorrect = verifyPassword(password.trim());
    
    if (isCorrect) {
      setSuccess(true);
      setError('');
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError('Incorrect password. Please try again.');
    }
  };
  
  const handleSkip = () => {
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
            <Text style={styles.modalTitle}>Subscription Verification</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.dark.text} />
            </Pressable>
          </View>
          
          {success ? (
            <View style={styles.successContainer}>
              <CheckCircle size={48} color={Colors.dark.primary} />
              <Text style={styles.successText}>Subscription verified!</Text>
              <Text style={styles.successSubtext}>You now have unlimited access to Scarlett AI.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.description}>
                Enter your subscription password to unlock unlimited messages.
              </Text>
              
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
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <Pressable style={styles.verifyButton} onPress={handleVerify}>
                <Text style={styles.verifyButtonText}>Verify Subscription</Text>
              </Pressable>
              
              <Pressable style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </Pressable>
              
              <Text style={styles.hint}>
                Hint: If you've purchased a subscription, your password was shown on the payment success screen.
              </Text>
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
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  skipButtonText: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
  hint: {
    color: Colors.dark.subtext,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
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

export default PasswordVerificationModal;