import React from 'react';
import { Modal, View, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface FullScreenImageProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const FullScreenImage: React.FC<FullScreenImageProps> = ({ visible, imageUri, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable 
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <X size={24} color="#FFFFFF" />
        </Pressable>
        
        <Pressable style={styles.imageContainer} onPress={onClose}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="contain"
            transition={300}
          />
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: width * 1.5, // Maintain aspect ratio
    maxHeight: height * 0.9,
  },
});

export default FullScreenImage;