import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView, Linking, Platform, TextInput } from 'react-native';
import { CreditCard, X, CheckCircle, AlertCircle, Calendar, Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useSubscriptionStore from '@/store/subscription-store';
import { FREE_MESSAGE_LIMIT, SUBSCRIPTION_PRICE } from '@/types/subscription';
import { useRouter } from 'expo-router';

interface SubscriptionModalProps {
  visible: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ visible }) => {
  const { hideSubscriptionModal, isProcessingPayment, setProcessingPayment, setSubscription } = useSubscriptionStore();
  const router = useRouter();
  
  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [email, setEmail] = useState('');
  
  const handleClose = () => {
    if (!isProcessingPayment) {
      hideSubscriptionModal();
      setShowPaymentForm(false);
    }
  };
  
  const handleShowPaymentForm = () => {
    setShowPaymentForm(true);
  };
  
  const handleBackToOptions = () => {
    setShowPaymentForm(false);
  };
  
  const handleProcessPayment = async () => {
    // Basic validation
    if (!cardNumber.trim() || !expiryDate.trim() || !cvv.trim() || !email.trim()) {
      Alert.alert("Error", "Please fill in all payment details");
      return;
    }
    
    try {
      setProcessingPayment(true);
      
      // In a real app, you would:
      // 1. Call your backend to create a Stripe Checkout Session
      // 2. Process the payment details securely
      
      // For demo purposes, we'll simulate a successful payment
      // and redirect to the success page directly
      setTimeout(() => {
        setProcessingPayment(false);
        router.push('/payment-success');
      }, 1500);
    } catch (error) {
      console.error("Error processing payment:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
      setProcessingPayment(false);
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // limit to 16 digits + 3 spaces
  };
  
  // Format expiry date with slash
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/[^0-9]/gi, '');
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };
  
  if (showPaymentForm) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleBackToOptions}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Details</Text>
              {!isProcessingPayment && (
                <Pressable onPress={handleBackToOptions} style={styles.closeButton}>
                  <X size={24} color={Colors.dark.text} />
                </Pressable>
              )}
            </View>
            
            <View style={styles.securePaymentHeader}>
              <Lock size={16} color={Colors.dark.primary} />
              <Text style={styles.securePaymentText}>Secure Payment</Text>
            </View>
            
            <View style={styles.paymentForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Card Number</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="4242 4242 4242 4242"
                  placeholderTextColor={Colors.dark.subtext}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="number-pad"
                  maxLength={19}
                  editable={!isProcessingPayment}
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="MM/YY"
                    placeholderTextColor={Colors.dark.subtext}
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="number-pad"
                    maxLength={5}
                    editable={!isProcessingPayment}
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>CVV</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="123"
                    placeholderTextColor={Colors.dark.subtext}
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                    editable={!isProcessingPayment}
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.dark.subtext}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isProcessingPayment}
                />
              </View>
              
              <View style={styles.paymentDetails}>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Subscription</Text>
                  <Text style={styles.paymentValue}>Scarlett AI 30-day access</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Price</Text>
                  <Text style={styles.paymentValue}>${SUBSCRIPTION_PRICE}.00 USD</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Payment to</Text>
                  <Text style={styles.paymentValue}>IBAN: ES92 1583 0001 1490 3709 0238</Text>
                </View>
              </View>
            </View>
            
            <Pressable 
              style={styles.payButton} 
              onPress={handleProcessPayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.payButtonText}>Pay ${SUBSCRIPTION_PRICE}.00</Text>
              )}
            </Pressable>
            
            <Text style={styles.disclaimer}>
              Your payment will be processed securely. Subscription automatically expires after 30 days.
            </Text>
            
            <View style={styles.stripeLogoContainer}>
              <Text style={styles.poweredByText}>Powered by</Text>
              <View style={styles.stripeLogo}>
                <Text style={styles.stripeText}>stripe</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Subscription Required</Text>
              {!isProcessingPayment && (
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color={Colors.dark.text} />
                </Pressable>
              )}
            </View>
            
            <View style={styles.limitReachedIcon}>
              <CreditCard size={48} color={Colors.dark.primary} />
            </View>
            
            <Text style={styles.limitReachedText}>
              You've reached your free message limit of {FREE_MESSAGE_LIMIT} messages.
            </Text>
            
            <Text style={styles.subscriptionInfo}>
              To continue chatting with Scarlett, please unlock 30-day full access for just ${SUBSCRIPTION_PRICE}.
            </Text>
            
            <View style={styles.paymentInfoContainer}>
              <View style={styles.paymentInfoItem}>
                <CheckCircle size={18} color={Colors.dark.primary} />
                <Text style={styles.paymentInfoText}>Secure payment via Stripe</Text>
              </View>
              <View style={styles.paymentInfoItem}>
                <CheckCircle size={18} color={Colors.dark.primary} />
                <Text style={styles.paymentInfoText}>One-time payment - no recurring charges</Text>
              </View>
              <View style={styles.paymentInfoItem}>
                <CheckCircle size={18} color={Colors.dark.primary} />
                <Text style={styles.paymentInfoText}>Unlimited messages for 30 days</Text>
              </View>
              <View style={styles.paymentInfoItem}>
                <Calendar size={18} color={Colors.dark.primary} />
                <Text style={styles.paymentInfoText}>Funds go to IBAN: ES92 1583 0001 1490 3709 0238</Text>
              </View>
            </View>
            
            <Pressable 
              style={styles.payButton} 
              onPress={handleShowPaymentForm}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.payButtonText}>Pay with Stripe</Text>
              )}
            </Pressable>
            
            {!isProcessingPayment && (
              <Pressable style={styles.closeTextButton} onPress={handleClose}>
                <Text style={styles.closeTextButtonText}>Maybe Later</Text>
              </Pressable>
            )}
            
            <Text style={styles.disclaimer}>
              Your payment will be processed securely by Stripe. Subscription automatically expires after 30 days.
            </Text>
            
            <View style={styles.stripeLogoContainer}>
              <Text style={styles.poweredByText}>Powered by</Text>
              <View style={styles.stripeLogo}>
                <Text style={styles.stripeText}>stripe</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
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
  limitReachedIcon: {
    alignItems: 'center',
    marginVertical: 20,
  },
  limitReachedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subscriptionInfo: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  paymentInfoContainer: {
    backgroundColor: 'rgba(255, 64, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  paymentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  paymentInfoText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  payButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeTextButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  closeTextButtonText: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
  disclaimer: {
    color: Colors.dark.subtext,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  stripeLogoContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  poweredByText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginBottom: 4,
  },
  stripeLogo: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#635BFF',
    borderRadius: 4,
  },
  stripeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Payment form styles
  securePaymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  securePaymentText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentForm: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formLabel: {
    color: Colors.dark.text,
    marginBottom: 8,
    fontSize: 14,
  },
  formInput: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.dark.text,
    fontSize: 16,
  },
  paymentDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  paymentValue: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SubscriptionModal;