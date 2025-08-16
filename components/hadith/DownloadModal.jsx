import { Feather, Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import { unzipSync } from 'fflate';
import { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

export default function DownloadModal({ 
  showModal, 
  setShowModal, 
  bookId, 
  bookName, 
  fileSize, 
  hadithCount, 
  colorCode,
  setChapters
}) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedMB, setDownloadedMB] = useState(0);
  const [hasInternet, setHasInternet] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const BOOK_URL = `https://cdn.jsdelivr.net/gh/DevWithEasy/app-file-store-repo/hadith/book_${bookId}.zip`;
  const BOOK_DIR = FileSystem.documentDirectory + `app_dir/hadith/book_${bookId}`;

  useEffect(() => {
    if (showModal) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [showModal]);

  const startDownload = async () => {
    const netState = await NetInfo.fetch();
    setHasInternet(netState.isConnected);

    if (!netState.isConnected) {
      Alert.alert('ইন্টারনেট নেই', 'ডাউনলোড করতে ইন্টারনেট সংযোগ প্রয়োজন');
      return;
    }

    try {
      setDownloading(true);
      await FileSystem.makeDirectoryAsync(BOOK_DIR, { intermediates: true });

      const downloadResumable = FileSystem.createDownloadResumable(
        BOOK_URL,
        `${BOOK_DIR}/book_${bookId}.zip`,
        {},
        (downloadProgress) => {
          const progressFraction =
            downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setProgress(progressFraction);
          setDownloadedMB(downloadProgress.totalBytesWritten / (1024 * 1024));
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      setDownloading(false);
      setProcessing(true);
      
      const fileData = await FileSystem.readAsStringAsync(uri, { 
        encoding: FileSystem.EncodingType.Base64 
      });
      const buffer = Buffer.from(fileData, 'base64');
      const files = unzipSync(buffer);
      
      for (const fileName in files) {
        const content = files[fileName];
        const path = `${BOOK_DIR}/${fileName}`;
        await FileSystem.writeAsStringAsync(path, Buffer.from(content).toString(), { 
          encoding: FileSystem.EncodingType.UTF8 
        });
      }
      
      setProcessing(false);
      setShowModal(false);
      
      // Reload chapters after download
      const data = await FileSystem.readAsStringAsync(`${BOOK_DIR}/book_${bookId}_chapters.json`);
      setChapters(JSON.parse(data));
    } catch (err) {
      console.log('Download error:', err);
      await FileSystem.deleteAsync(BOOK_DIR, { idempotent: true });
      Alert.alert('ডাউনলোড ব্যর্থ হয়েছে', 'অনুগ্রহ করে আবার চেষ্টা করুন।');
      setDownloading(false);
      setProcessing(false);
    }
  };

  return (
    <Animated.View style={[styles.modalOverlay, { 
      display: showModal ? 'flex' : 'none',
      opacity: fadeAnim 
    }]}>
      <Pressable 
        style={styles.modalOverlayPressable}
        onPress={() => !(downloading || processing) && setShowModal(false)}
      >
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="cloud-download-outline" size={28} color="#037764" />
            </View>
            <Text style={styles.modalTitle}>হাদিসের বই ডাউনলোড করুন</Text>
            <Text style={styles.modalSubtitle}>{bookName}</Text>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              এই বইটি আপনার ডিভাইসে নেই। পড়ার জন্য প্রথমে ডাউনলোড করুন।
            </Text>
            
            <View style={styles.fileInfoContainer}>
              <View style={styles.fileInfoItem}>
                <Feather name="hard-drive" size={16} color="#555" />
                <Text style={styles.fileInfoText}>ফাইল সাইজ: {fileSize} MB</Text>
              </View>
              <View style={styles.fileInfoItem}>
                <Feather name="book" size={16} color="#555" />
                <Text style={styles.fileInfoText}>হাদিস সংখ্যা: {hadithCount}</Text>
              </View>
            </View>

            {(downloading || processing) && (
              <View style={styles.progressContainer}>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>
                    {processing ? 'ফাইল প্রসেসিং...' : `ডাউনলোড হচ্ছে: ${downloadedMB.toFixed(1)}MB / ${(fileSize / (1024 * 1024)).toFixed(1)}MB`}
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
                        backgroundColor: colorCode
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
                (downloading || processing) && styles.buttonDisabled
              ]}
              onPress={() => !(downloading || processing) && setShowModal(false)}
              disabled={downloading || processing}
            >
              <Text style={styles.cancelButtonText}>বাতিল</Text>
            </Pressable>
            <Pressable 
              style={({ pressed }) => [
                styles.modalButton, 
                styles.downloadButton,
                pressed && styles.buttonPressed,
                (downloading || processing) && styles.buttonDisabled
              ]}
              onPress={startDownload}
              disabled={!hasInternet || downloading || processing}
            >
              <Text style={styles.downloadButtonText}>
                {downloading || processing ? (
                  <>
                    <Ionicons name="cloud-download" size={16} color="white" />{' '}
                    প্রক্রিয়াধীন...
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
      </Pressable>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

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
    borderRadius: 16,
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
    padding: 24,
    paddingTop: 16,
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
  },
});