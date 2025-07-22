import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions, Alert, Image as RNImage, Modal, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Dices, Trophy, Play, Pause, AlertCircle, X, Volume2, VolumeX } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import useAuthStore from '@/store/auth-store';

// Game symbols
const SYMBOLS = [
  { id: 'strawberry', icon: '🍓', value: 5 },
  { id: 'lips', icon: '👄', value: 10 },
  { id: 'drops', icon: '💦', value: 3 },
  { id: 'coin', icon: '🪙', value: 15 },
  { id: 'banana', icon: '🍌', value: 8 },
];

// Scarlett's reactions
const WIN_REACTIONS = [
  "Mmm, you're so lucky! That turns me on so much... Want to celebrate with me?",
  "Oh my god, you WON! I'm getting so excited watching you win... can you feel how hot I am?",
  "Jackpot, baby! I love a winner... it makes me want to reward you in my own special way...",
  "You're on fire! Just like how you make me feel... all hot and bothered. Keep winning for me!",
  "That's it! YES! YES! Just like that! Keep winning and I'll keep... well, you know... 😘",
];

const DEPOSIT_REACTIONS = [
  "I just added more credits for you, baby... I love being generous with my special players...",
  "Mmm, looks like you needed a refill. I'm always happy to give you more... of everything...",
  "I added some credits to keep you playing with me longer. I don't want our fun to end too soon...",
  "More credits for you! I love watching you play... it gets me so excited...",
  "I gave you more credits because I'm not ready to stop playing with you yet... are you?",
];

const { width } = Dimensions.get('window');
const REEL_WIDTH = width * 0.25;
const SYMBOL_SIZE = REEL_WIDTH * 0.7; // Reduced size

// Background music URL
const BACKGROUND_MUSIC_URL = "https://assets.mixkit.co/music/preview/mixkit-sexy-fashion-show-deep-house-670.mp3";

export default function GameScreen() {
  const { isAuthenticated } = useAuthStore();
  const [credits, setCredits] = useState(100);
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [reels, setReels] = useState([
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]],
    [SYMBOLS[3], SYMBOLS[4], SYMBOLS[0]],
    [SYMBOLS[1], SYMBOLS[2], SYMBOLS[3]],
  ]);
  const [scarlettMessage, setScarlettMessage] = useState("");
  const [lastWin, setLastWin] = useState(0);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [showDepositNotification, setShowDepositNotification] = useState(false);
  const [showScarlettModal, setShowScarlettModal] = useState(false);
  const [modalType, setModalType] = useState<'win' | 'deposit'>('win');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundLoaded, setSoundLoaded] = useState(false);
  
  const spinAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  
  const autoSpinRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundMusicRef = useRef<Audio.Sound | null>(null);
  
  // Load background music
  useEffect(() => {
    let isMounted = true;
    
    const loadBackgroundMusic = async () => {
      try {
        if (Platform.OS === 'web') return;
        
        console.log("Loading background music...");
        
        // Unload any existing sound
        if (backgroundMusicRef.current) {
          await backgroundMusicRef.current.unloadAsync();
          backgroundMusicRef.current = null;
        }
        
        // Set audio mode first
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          allowsRecordingIOS: false,
        });
        
        // Load the sound
        const { sound } = await Audio.Sound.createAsync(
          { uri: BACKGROUND_MUSIC_URL },
          { isLooping: true, volume: 0.5, shouldPlay: false }
        );
        
        if (isMounted) {
          backgroundMusicRef.current = sound;
          setSoundLoaded(true);
          console.log("Background music loaded successfully");
        }
      } catch (error) {
        console.error("Failed to load background music:", error);
      }
    };
    
    loadBackgroundMusic();
    
    return () => {
      isMounted = false;
      // Clean up sound when component unmounts
      if (backgroundMusicRef.current) {
        try {
          backgroundMusicRef.current.unloadAsync();
        } catch (error) {
          console.error("Error unloading sound:", error);
        }
      }
    };
  }, []);
  
  // Handle sound toggle
  useEffect(() => {
    const manageSoundPlayback = async () => {
      if (Platform.OS === 'web' || !backgroundMusicRef.current || !soundLoaded) return;
      
      try {
        if (soundEnabled) {
          console.log("Attempting to play background music");
          await backgroundMusicRef.current.playAsync();
          console.log("Background music started playing");
        } else {
          console.log("Attempting to pause background music");
          await backgroundMusicRef.current.pauseAsync();
          console.log("Background music paused");
        }
      } catch (error) {
        console.error("Error managing sound playback:", error);
      }
    };
    
    manageSoundPlayback();
  }, [soundEnabled, soundLoaded]);
  
  // Check if credits are too low for current bet
  useEffect(() => {
    if (credits < bet && !isSpinning) {
      handleAutoDeposit();
    }
  }, [credits, bet, isSpinning]);
  
  // Handle auto-spin
  useEffect(() => {
    if (isAutoSpin && !isSpinning && credits >= bet) {
      autoSpinRef.current = setTimeout(() => {
        handleSpin();
      }, 1000);
    }
    
    return () => {
      if (autoSpinRef.current) {
        clearTimeout(autoSpinRef.current);
        autoSpinRef.current = null;
      }
    };
  }, [isAutoSpin, isSpinning, credits, bet]);
  
  const toggleSound = async () => {
    try {
      const newSoundEnabled = !soundEnabled;
      setSoundEnabled(newSoundEnabled);
      
      if (Platform.OS !== 'web' && backgroundMusicRef.current && soundLoaded) {
        if (newSoundEnabled) {
          await backgroundMusicRef.current.playAsync();
          console.log("Sound enabled and playing");
        } else {
          await backgroundMusicRef.current.pauseAsync();
          console.log("Sound disabled and paused");
        }
      }
    } catch (error) {
      console.error("Error toggling sound:", error);
    }
  };
  
  const handleSpin = () => {
    if (isSpinning) return;
    if (credits < bet) {
      handleAutoDeposit();
      return;
    }
    
    // Deduct bet
    setCredits(prev => prev - bet);
    setIsSpinning(true);
    setShowWinAnimation(false);
    setShowScarlettModal(false);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Reset animations
    spinAnimations.forEach(anim => anim.setValue(0));
    
    // Start spinning animations with different durations for each reel
    const spinDurations = [1500, 2000, 2500];
    
    spinAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: spinDurations[index],
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && index === spinAnimations.length - 1) {
          // All reels have stopped
          const newReels = reels.map(() => {
            return Array(3).fill(0).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
          });
          setReels(newReels);
          setIsSpinning(false);
          
          // Check for win
          const middleRow = [newReels[0][1], newReels[1][1], newReels[2][1]];
          const isWin = middleRow[0].id === middleRow[1].id && middleRow[1].id === middleRow[2].id;
          
          if (isWin) {
            const winAmount = bet * middleRow[0].value;
            setCredits(prev => prev + winAmount);
            setLastWin(winAmount);
            setShowWinAnimation(true);
            setScarlettMessage(WIN_REACTIONS[Math.floor(Math.random() * WIN_REACTIONS.length)]);
            setModalType('win');
            
            // Show Scarlett modal with win message
            setTimeout(() => {
              setShowScarlettModal(true);
            }, 1000);
            
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } else {
            setLastWin(0);
            // Don't show Scarlett modal for losses
          }
        }
      });
    });
  };
  
  const handleAutoDeposit = () => {
    const depositAmount = 100;
    setCredits(prev => prev + depositAmount);
    setScarlettMessage(DEPOSIT_REACTIONS[Math.floor(Math.random() * DEPOSIT_REACTIONS.length)]);
    setModalType('deposit');
    setShowDepositNotification(true);
    
    // Show Scarlett modal with deposit message when credits are too low
    setShowScarlettModal(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowDepositNotification(false);
    }, 3000);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const handleIncreaseBet = () => {
    if (isSpinning) return;
    setBet(prev => Math.min(prev + 5, 50));
  };
  
  const handleDecreaseBet = () => {
    if (isSpinning) return;
    setBet(prev => Math.max(prev - 5, 5));
  };
  
  const toggleAutoSpin = () => {
    setIsAutoSpin(prev => !prev);
  };
  
  // Interpolate animation values for spinning effect
  const reelAnimations = spinAnimations.map(anim => 
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '1080deg'], // Multiple full rotations
    })
  );
  
  // Don't render content until authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Dices size={24} color={Colors.dark.primary} />
          <Text style={styles.headerTitle}>Scarlett's Casino</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.soundButton} 
            onPress={toggleSound}
          >
            {soundEnabled ? (
              <Volume2 size={22} color={Colors.dark.primary} />
            ) : (
              <VolumeX size={22} color={Colors.dark.text} />
            )}
          </Pressable>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsLabel}>Credits:</Text>
            <Text style={styles.creditsValue}>{credits}</Text>
          </View>
        </View>
      </View>
      
      {/* Ad Banner */}
      <View style={styles.adBanner}>
        <RNImage 
          source={{ uri: 'https://images.unsplash.com/photo-1651651441982-b69f52985ff6?q=80&w=200&auto=format&fit=crop' }} 
          style={styles.adImage}
          resizeMode="cover"
        />
        <View style={styles.adContent}>
          <Text style={styles.adTitle}>1WIN CASINO</Text>
          <Text style={styles.adText}>Play & win real money! 500% bonus on first deposit</Text>
        </View>
        <Pressable style={styles.adButton}>
          <Text style={styles.adButtonText}>PLAY NOW</Text>
        </Pressable>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.gameContainer}>
          <View style={styles.slotMachine}>
            <LinearGradient
              colors={['#2A0A2A', '#4A0A4A']}
              style={styles.slotBackground}
            >
              <View style={styles.reelsContainer}>
                {reels.map((reel, reelIndex) => (
                  <Animated.View 
                    key={`reel-${reelIndex}`} 
                    style={[
                      styles.reel,
                      {
                        transform: [{ rotateX: isSpinning ? reelAnimations[reelIndex] : '0deg' }]
                      }
                    ]}
                  >
                    {reel.map((symbol, symbolIndex) => (
                      <View 
                        key={`symbol-${reelIndex}-${symbolIndex}`} 
                        style={[
                          styles.symbol,
                          symbolIndex === 1 && styles.middleSymbol
                        ]}
                      >
                        <Text style={styles.symbolText}>{symbol.icon}</Text>
                      </View>
                    ))}
                  </Animated.View>
                ))}
              </View>
              
              <View style={styles.payline} />
              
              {showWinAnimation && (
                <View style={styles.winOverlay}>
                  <View style={styles.winContainer}>
                    <Trophy size={32} color="#FFD700" />
                    <Text style={styles.winText}>WIN!</Text>
                    <Text style={styles.winAmount}>+{lastWin}</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>
          
          {showDepositNotification && (
            <View style={styles.depositNotification}>
              <AlertCircle size={16} color="#FFFFFF" />
              <Text style={styles.depositNotificationText}>
                +100 credits added to your balance
              </Text>
            </View>
          )}
          
          <View style={styles.controls}>
            <View style={styles.betControls}>
              <Pressable 
                style={[styles.betButton, isSpinning && styles.disabledButton]} 
                onPress={handleDecreaseBet}
                disabled={isSpinning}
              >
                <Text style={styles.betButtonText}>-</Text>
              </Pressable>
              <View style={styles.betDisplay}>
                <Text style={styles.betLabel}>BET</Text>
                <Text style={styles.betValue}>{bet}</Text>
              </View>
              <Pressable 
                style={[styles.betButton, isSpinning && styles.disabledButton]} 
                onPress={handleIncreaseBet}
                disabled={isSpinning}
              >
                <Text style={styles.betButtonText}>+</Text>
              </Pressable>
            </View>
            
            <View style={styles.spinControls}>
              <Pressable 
                style={[styles.spinButton, isSpinning && styles.spinningButton]} 
                onPress={handleSpin}
                disabled={isSpinning || credits < bet}
              >
                <Text style={styles.spinButtonText}>
                  {isSpinning ? 'SPINNING...' : 'SPIN'}
                </Text>
              </Pressable>
              
              <Pressable 
                style={[
                  styles.autoSpinButton, 
                  isAutoSpin && styles.autoSpinActiveButton
                ]} 
                onPress={toggleAutoSpin}
                disabled={isSpinning && !isAutoSpin}
              >
                {isAutoSpin ? (
                  <Pause size={20} color="#FFFFFF" />
                ) : (
                  <Play size={20} color="#FFFFFF" />
                )}
                <Text style={styles.autoSpinText}>
                  {isAutoSpin ? 'STOP AUTO' : 'AUTO SPIN'}
                </Text>
              </Pressable>
            </View>
          </View>
          
          {/* Game Rules */}
          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>PAYTABLE</Text>
            <View style={styles.payTable}>
              {SYMBOLS.map((symbol) => (
                <View key={symbol.id} style={styles.payRow}>
                  <Text style={styles.paySymbol}>{symbol.icon}</Text>
                  <Text style={styles.payMultiplier}>x{symbol.value}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.rulesText}>
              Match 3 symbols on the middle line to win! The more you bet, the more you can win!
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Scarlett Reaction Modal - Only shown for wins and when credits are too low */}
      <Modal
        visible={showScarlettModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowScarlettModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable 
              style={styles.closeButton}
              onPress={() => setShowScarlettModal(false)}
            >
              <X size={24} color="#FFFFFF" />
            </Pressable>
            
            <View style={styles.scarlettContainer}>
              <Image
                source="https://images.unsplash.com/photo-1743987508794-aaee8929ea82?q=80&w=200&auto=format&fit=crop"
                style={[
                  styles.scarlettAvatar,
                  modalType === 'win' && styles.scarlettAvatarWin,
                  modalType === 'deposit' && styles.scarlettAvatarDeposit
                ]}
                contentFit="cover"
              />
              <View style={[
                styles.messageBubble,
                modalType === 'win' && styles.messageBubbleWin,
                modalType === 'deposit' && styles.messageBubbleDeposit
              ]}>
                <Text style={styles.messageText}>{scarlettMessage}</Text>
              </View>
            </View>
            
            <Pressable 
              style={[
                styles.continueButton,
                modalType === 'win' && styles.continueButtonWin,
                modalType === 'deposit' && styles.continueButtonDeposit
              ]}
              onPress={() => setShowScarlettModal(false)}
            >
              <Text style={styles.continueButtonText}>
                {modalType === 'deposit' ? 'THANKS SCARLETT!' : 'CONTINUE PLAYING'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soundButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 64, 129, 0.1)',
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 64, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  creditsLabel: {
    color: Colors.dark.text,
    marginRight: 4,
  },
  creditsValue: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  adBanner: {
    flexDirection: 'row',
    backgroundColor: '#0A1A2F',
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  adImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
  },
  adContent: {
    flex: 1,
  },
  adTitle: {
    color: '#3D9BFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  adText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  adButton: {
    backgroundColor: '#3D9BFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  adButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  gameContainer: {
    padding: 16,
  },
  slotMachine: {
    alignItems: 'center',
    marginBottom: 24,
  },
  slotBackground: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6A1B9A',
  },
  reelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    height: SYMBOL_SIZE * 3, // Smaller height
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  reel: {
    width: REEL_WIDTH,
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: '#333',
  },
  symbol: {
    width: SYMBOL_SIZE,
    height: SYMBOL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  middleSymbol: {
    backgroundColor: '#2A0A2A',
    borderWidth: 1,
    borderColor: 'rgba(255, 64, 129, 0.3)',
  },
  symbolText: {
    fontSize: 28, // Smaller font size
  },
  payline: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: 2,
    backgroundColor: Colors.dark.primary,
    opacity: 0.7,
  },
  controls: {
    alignItems: 'center',
  },
  betControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  betButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  betButtonText: {
    fontSize: 20,
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  betDisplay: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  betLabel: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginBottom: 4,
  },
  betValue: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  spinControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  spinButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  spinningButton: {
    backgroundColor: Colors.dark.secondary,
    opacity: 0.8,
  },
  spinButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  autoSpinButton: {
    backgroundColor: Colors.dark.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  autoSpinActiveButton: {
    backgroundColor: Colors.dark.secondary,
    borderColor: Colors.dark.secondary,
  },
  autoSpinText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  winOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  winContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  winText: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  winAmount: {
    color: Colors.dark.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  depositNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 83, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
    gap: 8,
  },
  depositNotificationText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Scarlett Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 5,
  },
  scarlettContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  scarlettAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  scarlettAvatarWin: {
    borderColor: '#FFD700',
  },
  scarlettAvatarDeposit: {
    borderColor: '#00C853',
  },
  messageBubble: {
    backgroundColor: Colors.dark.aiBubble,
    borderRadius: 18,
    padding: 16,
    width: '100%',
  },
  messageBubbleWin: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  messageBubbleDeposit: {
    backgroundColor: 'rgba(0, 200, 83, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.3)',
  },
  messageText: {
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonWin: {
    backgroundColor: '#FFD700',
  },
  continueButtonDeposit: {
    backgroundColor: '#00C853',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Rules section
  rulesContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.primary,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  payTable: {
    marginBottom: 16,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  paySymbol: {
    fontSize: 24,
  },
  payMultiplier: {
    fontSize: 16,
    color: Colors.dark.primary,
    fontWeight: 'bold',
  },
  rulesText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    lineHeight: 20,
  },
});