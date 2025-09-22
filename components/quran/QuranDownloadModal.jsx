import { Feather, Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function QuranDownloadModal({ 
  showModal, 
  setShowModal, 
  bookName, 
  fileSize, 
  suraCount, 
  colorCode = '#037764',
  onDownload,
  progress
}) {
  const [downloading, setDownloading] = useState(false);
  const [hasInternet, setHasInternet] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    if (showModal) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
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
      console.error('Download error:', err);
      Alert.alert('ডাউনলোড ব্যর্থ হয়েছে', 'অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setDownloading(false);
    }
  };

  const handleClose = () => {
    if (!downloading) {
      // অ্যানিমেশন সহ বন্ধ করার জন্য
      setShowModal(false);
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <Pressable 
        style={styles.modalOverlayPressable} 
        onPress={handleClose} 
        disabled={downloading}
      >
        {/* ব্যাকগ্রাউন্ড টাচ হলে বন্ধ */}
      </Pressable>

      <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.modalHeader}>
          <View style={styles.modalIconContainer}>
            <Ionicons name="cloud-download-outline" size={28} color={colorCode} />
          </View>
          <Text style={styles.modalTitle}>কুরআন শরীফ ডাউনলোড করুন</Text>
          <Text style={styles.modalSubtitle}>{bookName}</Text>
        </View>

        <View style={styles.modalBody}>
          <Text style={styles.modalText}>
            কুরআনের ডাটা আপনার ডিভাইসে নেই। পড়ার জন্য প্রথমে ডাউনলোড করুন।
          </Text>

          <View style={styles.fileInfoContainer}>
            <View style={styles.fileInfoItem}>
              <Feather name="hard-drive" size={16} color="#555" />
              <Text style={styles.fileInfoText}>ফাইল সাইজ: {fileSize} MB</Text>
            </View>
            <View style={styles.fileInfoItem}>
              <Feather name="book" size={16} color="#555" />
              <Text style={styles.fileInfoText}>সূরা সংখ্যা: {suraCount}</Text>
            </View>
          </View>

          {downloading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>
                  ডাউনলোড হচ্ছে: {(progress * fileSize).toFixed(1)}MB / {fileSize}MB
                </Text>
                <Text style={styles.progressPercent}>
                  {(progress * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { 
                      width: `${progress * 100}%`,
                      backgroundColor: colorCode,
                    }
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.modalFooter}>
          <Pressable 
            style={({ pressed }) => [
              styles.modalButton, 
              styles.cancelButton,
              pressed && styles.buttonPressed,
              downloading && styles.buttonDisabled
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
              downloading && styles.buttonDisabled
            ]}
            onPress={handleDownload}
            disabled={!hasInternet || downloading}
          >
            <Text style={styles.downloadButtonText}>
              {downloading ? (
                <>
                  <Ionicons name="cloud-download" size={16} color="white" />{' '}
                  ডাউনলোড হচ্ছে...
                </>
              ) : (
                <>
                  <Ionicons name="cloud-download" size={16} color="white" />{' '}
                  ডাউনলোড করুন
                </>
              )}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
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
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  modalContainer: {
    width: width - 40,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    paddingBottom: 0,
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e6f7f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'bangla_bold',
    textAlign: 'center',
    color: '#037764',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: 'bangla_medium',
    textAlign: 'center',
    color: '#555',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  modalText: {
    textAlign: 'center',
    color: '#555',
    fontFamily: 'bangla_regular',
    marginBottom: 16,
    lineHeight: 22,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  fileInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1efefff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  fileInfoText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#555',
    fontFamily: 'bangla_regular',
  },
  progressContainer: {
    marginTop: 8,
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
    color: '#037764',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
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
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#555',
    fontFamily: 'bangla_bold',
  },
  downloadButton: {
    backgroundColor: '#037764',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: 'white',
    fontFamily: 'bangla_bold',
    marginLeft: 6,
    fontSize: 14,
  },
});