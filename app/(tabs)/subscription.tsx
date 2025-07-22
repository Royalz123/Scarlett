import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, CheckCircle, AlertCircle, Calendar, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useSubscriptionStore from '@/store/subscription-store';
import useAuthStore from '@/store/auth-store';
import { FREE_MESSAGE_LIMIT, SUBSCRIPTION_DAYS } from '@/types/subscription';

export default function SubscriptionScreen() {
  const { 
    subscriptionValid, 
    subscriptionStartDate, 
    messageCount,
    showSubscriptionModal,
    isProcessingPayment
  } = useSubscriptionStore();
  const { isAuthenticated } = useAuthStore();
  
  // Format the expiration date
  const getExpirationDate = () => {
    if (!subscriptionStartDate) return null;
    
    const startDate = new Date(subscriptionStartDate);
    const expirationDate = new Date(startDate);
    expirationDate.setDate(expirationDate.getDate() + SUBSCRIPTION_DAYS);
    
    return expirationDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Calculate days remaining in subscription
  const getDaysRemaining = () => {
    if (!subscriptionStartDate || !subscriptionValid) return 0;
    
    const startDate = new Date(subscriptionStartDate);
    const expirationDate = new Date(startDate);
    expirationDate.setDate(expirationDate.getDate() + SUBSCRIPTION_DAYS);
    
    const currentDate = new Date();
    const diffTime = expirationDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };
  
  const daysRemaining = getDaysRemaining();
  const expirationDate = getExpirationDate();
  const freeMessagesRemaining = Math.max(0, FREE_MESSAGE_LIMIT - messageCount);
  const messagesRemaining = subscriptionValid ? 'Unlimited' : freeMessagesRemaining.toString();
  
  // Helper function to determine message count style
  const getMessageCountStyle = () => {
    if (subscriptionValid) return styles.unlimitedMessages;
    if (parseInt(messagesRemaining) > 0) return styles.limitedMessages;
    return styles.noMessages;
  };
  
  // Don't render content until authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscription</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <CreditCard size={24} color={Colors.dark.primary} />
            <Text style={styles.statusTitle}>Subscription Status</Text>
          </View>
          
          <View style={[
            styles.statusBadge,
            subscriptionValid ? styles.activeStatusBadge : styles.inactiveStatusBadge
          ]}>
            {subscriptionValid ? (
              <CheckCircle size={16} color="#FFFFFF" />
            ) : (
              <AlertCircle size={16} color="#FFFFFF" />
            )}
            <Text style={styles.statusBadgeText}>
              {subscriptionValid ? 'Active' : 'Inactive'}
            </Text>
          </View>
          
          <View style={styles.statusDetails}>
            <View style={styles.statusItem}>
              <Calendar size={20} color={Colors.dark.subtext} />
              <View>
                <Text style={styles.statusLabel}>Expiration Date</Text>
                <Text style={styles.statusValue}>
                  {subscriptionValid 
                    ? expirationDate 
                    : 'No active subscription'}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <Clock size={20} color={Colors.dark.subtext} />
              <View>
                <Text style={styles.statusLabel}>Time Remaining</Text>
                <Text style={styles.statusValue}>
                  {subscriptionValid 
                    ? `${daysRemaining} days` 
                    : 'Expired'}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.messagesLabel}>Messages Remaining</Text>
              <Text style={[styles.messagesValue, getMessageCountStyle()]}>
                {messagesRemaining}
              </Text>
            </View>
          </View>
        </View>
        
        {!subscriptionValid && (
          <View style={styles.subscriptionOffer}>
            <Text style={styles.offerTitle}>Unlock Full Access</Text>
            <Text style={styles.offerDescription}>
              Get unlimited messages with Scarlett for 30 days.
            </Text>
            <View style={styles.pricingContainer}>
              <Text style={styles.pricingLabel}>Just</Text>
              <Text style={styles.price}>$1</Text>
              <Text style={styles.pricingPeriod}>/ 30 days</Text>
            </View>
            <Pressable 
              style={styles.subscribeButton}
              onPress={showSubscriptionModal}
              disabled={isProcessingPayment}
            >
              <Text style={styles.subscribeButtonText}>
                {isProcessingPayment ? 'Processing...' : 'Subscribe Now'}
              </Text>
            </Pressable>
          </View>
        )}
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Subscription Benefits</Text>
          <View style={styles.benefitItem}>
            <CheckCircle size={16} color={Colors.dark.primary} />
            <Text style={styles.benefitText}>Unlimited messages with Scarlett</Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle size={16} color={Colors.dark.primary} />
            <Text style={styles.benefitText}>No interruptions during conversations</Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle size={16} color={Colors.dark.primary} />
            <Text style={styles.benefitText}>Full access to all Scarlett's features</Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle size={16} color={Colors.dark.primary} />
            <Text style={styles.benefitText}>No recurring charges - expires automatically</Text>
          </View>
        </View>
        
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How does billing work?</Text>
            <Text style={styles.faqAnswer}>
              You pay a one-time fee of $1 for 30 days of unlimited access. Your subscription will automatically expire after 30 days with no recurring charges.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel my subscription?</Text>
            <Text style={styles.faqAnswer}>
              There's no need to cancel as your subscription automatically expires after 30 days.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What happens when my subscription expires?</Text>
            <Text style={styles.faqAnswer}>
              After expiration, you'll get 10 more free messages before needing to subscribe again.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Where does my payment go?</Text>
            <Text style={styles.faqAnswer}>
              All payments are processed securely via Stripe and funds go to IBAN: ES92 1583 0001 1490 3709 0238.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    padding: 16,
  },
  statusCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.primary,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  activeStatusBadge: {
    backgroundColor: '#4CAF50',
  },
  inactiveStatusBadge: {
    backgroundColor: '#F44336',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusDetails: {
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  statusValue: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  messagesLabel: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  messagesValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  unlimitedMessages: {
    color: '#4CAF50',
  },
  limitedMessages: {
    color: '#FFC107',
  },
  noMessages: {
    color: '#F44336',
  },
  subscriptionOffer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 16,
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  pricingLabel: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginRight: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  pricingPeriod: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginLeft: 4,
  },
  subscribeButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  faqSection: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.dark.subtext,
    lineHeight: 20,
  },
});