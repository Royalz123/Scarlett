import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useSubscriptionStore from '@/store/subscription-store';
import useAuthStore from '@/store/auth-store';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { setSubscription } = useSubscriptionStore();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Process successful payment
    const processPayment = async () => {
      try {
        // Set subscription as active with current date
        const startDate = new Date().toISOString();
        setSubscription(true, startDate);
        
        // Redirect back to chat after a short delay
        setTimeout(() => {
          router.replace('/');
        }, 3000);
      } catch (error) {
        console.error('Error processing payment success:', error);
      }
    };
    
    processPayment();
  }, []);
  
  // Don't render content until authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CheckCircle size={64} color={Colors.dark.primary} />
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.message}>
          Thank you for subscribing to Scarlett AI. You now have unlimited access for 30 days.
        </Text>
        <Text style={styles.passwordNote}>
          Your subscription is protected with a password: <Text style={styles.passwordHighlight}>sai25</Text>
        </Text>
        <Text style={styles.passwordInstructions}>
          Please remember this password. You'll need it to verify your subscription in the API Key settings.
        </Text>
        <ActivityIndicator color={Colors.dark.primary} style={styles.loader} />
        <Text style={styles.redirectText}>Redirecting you back to chat...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 20,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  passwordNote: {
    fontSize: 16,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  passwordHighlight: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  passwordInstructions: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  loader: {
    marginBottom: 16,
  },
  redirectText: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
});