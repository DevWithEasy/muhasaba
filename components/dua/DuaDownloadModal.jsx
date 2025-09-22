import { useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

export default function DuaDownloadModal({
  showModal,
  setShowModal,
  bookName,
  fileSize,
  itemCount,
  colorCode,
  onDownload,
  progress,
}) {
  const [downloading, setDownloading] = useState(false);
  const [hasInternet, setHasInternet] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    if (showModal) {
      // অ্যানিমেশন শুরু করার আগে ইনিশিয়াল ভ্যালু সেট করো
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(50);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [showModal]);

  const handleDownload = async () => {
    const netState = await NetInfo.fetch();
    setHasInternet(netState.isConnected);

    if (!netState.isConnected) {
      Alert.alert('ইন্টারনেট নেই', 'ডাউনলোড করতে ইন্টারনেট সংযোগ প্রয়োজন');
      return;
    }

    try {
      setDownloading(true);
      await onDownload();
    } catch (err) {
      console.log('Download error:', err);
      Alert.alert('ডাউনলোড ব্যর্থ হয়েছে', 'অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setDownloading(false);
    }
  };

  const handleClose = () => {
    if (!downloading) {
      // অ্যানিমেশন ট্রিগার করতে showModal কে false সেট করো
      setShowModal(false);
    }
  };

  // মডাল শো না থাকলে রেন্ডার করো না
  if (!showModal) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.modalOverlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Pressable style={styles.modalOverlayPressable} onPress={handleClose}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* হেডার সেকশন */}
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconContainer, { backgroundColor: '#e6f7f5' }]}>
              <Ionicons name="book-outline" size={28} color="#00897B" />
            </View>
            <Text style={styles.modalTitle}>দোয়া ডাউনলোড করুন</Text>
            <Text style={styles.modalSubtitle}>{bookName}</Text>
          </View>

          {/* বডি সেকশন */}
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              দোয়ার ডাটা আপনার ডিভাইসে নেই। পড়ার জন্য প্রথমে ডাউনলোড করুন।
            </Text>

            <View style={styles.fileInfoContainer}>
              <View style={styles.fileInfoItem}>
                <Feather name="hard-drive" size={16} color="#555" />
                <Text style={styles.fileInfoText}>ফাইল সাইজ: {fileSize} MB</Text>
              </View>
              <View style={styles.fileInfoItem}>
                <Feather name="list" size={16} color="#555" />
                <Text style={styles.fileInfoText}>আইটেম: {itemCount} টি</Text>
              </View>
            </View>

            {/* প্রোগ্রেস বার */}
            {downloading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>
                    ডাউনলোড হচ্ছে: {(progress * fileSize).toFixed(2)}MB / {fileSize}MB
                  </Text>
                  <Text style={styles.progressPercent}>{(progress * 100).toFixed(0)}%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progress * 100}%`,
                        backgroundColor: colorCode || '#00897B',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressNote}>দোয়ার ডাটা ডাউনলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</Text>
              </View>
            )}
          </View>

          {/* ফুটার সেকশন */}
          <View style={styles.modalFooter}>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                styles.cancelButton,
                pressed && styles.buttonPressed,
                downloading && styles.buttonDisabled,
              ]}
              onPress={handleClose}
              disabled={downloading}
            >
              <Text style={styles.cancelButtonText}>বাতিল</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                styles.downloadButton,
                pressed && styles.buttonPressed,
                downloading && styles.buttonDisabled,
              ]}
              onPress={handleDownload}
              disabled={!hasInternet || downloading}
            >
              <Text style={styles.downloadButtonText}>
                {downloading ? (
                  <>
                    <Ionicons name="cloud-download" size={16} color="white" /> ডাউনলোড হচ্ছে...
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-download" size={16} color="white" /> ডাউনলোড করুন
                  </>
                )}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalOverlayPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width - 40,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'bangla_bold',
    textAlign: 'center',
    color: '#00897B',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: 'bangla_medium',
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
  },
  modalBody: {
    padding: 24,
    paddingTop: 16,
  },
  modalText: {
    textAlign: 'center',
    color: '#555',
    fontFamily: 'bangla_regular',
    marginBottom: 16,
    lineHeight: 22,
    fontSize: 14,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 10,
  },
  fileInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fileInfoText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#555',
    fontFamily: 'bangla_medium',
  },
  progressContainer: {
    marginTop: 8,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'bangla_regular',
  },
  progressPercent: {
    fontSize: 13,
    fontFamily: 'bangla_bold',
    color: '#00897B',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressNote: {
    fontSize: 11,
    color: '#888',
    fontFamily: 'bangla_regular',
    textAlign: 'center',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 50,
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  cancelButtonText: {
    color: '#555',
    fontFamily: 'bangla_bold',
    fontSize: 14,
  },
  downloadButton: {
    backgroundColor: '#00897B',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: 'white',
    fontFamily: 'bangla_bold',
    fontSize: 14,
    marginLeft: 6,
  },
});