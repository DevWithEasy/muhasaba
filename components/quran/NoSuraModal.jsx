import { Feather, Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getDownloadKLink,
  getFilePath,
  getFolderPath,
} from "../../utils/audioControllers";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

const { width } = Dimensions.get("window");

export default function NoSuraModal({
  modalVisible,
  setModalVisible,
  surah,
  reciter,
  onDownloadComplete,
  onDownloadCancelled,
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [fileSizeMB, setFileSizeMB] = useState(null);
  const [hasInternet, setHasInternet] = useState(true);
  const [reciterName, setReciterName] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const downloadResumableRef = useRef(null);

  useEffect(() => {
    if (modalVisible) {
      getFileSize();
      getReciterName();
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
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      setIsDownloading(false);
      setDownloadProgress(0);
      setFileSizeMB(null);
      setReciterName("");
    }
  }, [modalVisible]);

  const getReciterName = async () => {
    try {
      const recitersPath = `${FileSystem.documentDirectory}app_dir/quran/reciters.json`;
      const fileInfo = await FileSystem.getInfoAsync(recitersPath);

      if (fileInfo.exists) {
        const recitersData = await FileSystem.readAsStringAsync(recitersPath);
        const reciters = JSON.parse(recitersData);
        const foundReciter = reciters.find((r) => r.id === reciter);
        if (foundReciter) {
          setReciterName(foundReciter.name);
        }
      }
    } catch (error) {
      console.error("Error fetching reciter name:", error);
    }
  };

  const getFileSize = async () => {
    try {
      const downloadUrl = await getDownloadKLink(reciter, surah.serial);
      const response = await fetch(downloadUrl, { method: "HEAD" });

      if (!response.ok) {
        throw new Error("Failed to fetch file headers");
      }

      const contentLength = response.headers.get("content-length");

      if (contentLength) {
        const sizeInMB = (parseInt(contentLength) / (1024 * 1024)).toFixed(2);
        setFileSizeMB(sizeInMB);
      }
    } catch (error) {
      console.error("Error getting file size:", error);
      setFileSizeMB("~3.5");
    }
  };

  const checkInternet = async () => {
    const state = await NetInfo.fetch();
    setHasInternet(state.isConnected && state.isInternetReachable);
    return state.isConnected && state.isInternetReachable;
  };

  const handleDownload = async () => {
    try {
      const isConnected = await checkInternet();
      if (!isConnected) {
        Alert.alert(
          "ডাউনলোড ব্যর্থ",
          "দয়া করে ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন"
        );
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);

      const downloadUrl = await getDownloadKLink(reciter, surah.serial);
      const dirUri = await getFolderPath(reciter);
      const downloadPath = await getFilePath(reciter, surah.serial);

      const dirInfo = await FileSystem.getInfoAsync(dirUri);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
      }

      // Check if partial file exists and delete it
      const partialFileInfo = await FileSystem.getInfoAsync(downloadPath);
      if (partialFileInfo.exists) {
        await FileSystem.deleteAsync(downloadPath);
      }

      downloadResumableRef.current = FileSystem.createDownloadResumable(
        downloadUrl,
        downloadPath,
        {},
        (progress) => {
          const progressPercent =
            progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
          setDownloadProgress(progressPercent);
        }
      );

      const { uri } = await downloadResumableRef.current.downloadAsync();

      // Verify download completed successfully
      const downloadedFileInfo = await FileSystem.getInfoAsync(uri);
      if (!downloadedFileInfo.exists || downloadedFileInfo.size === 0) {
        throw new Error("Downloaded file is empty or doesn't exist");
      }

      setIsDownloading(false);
      setModalVisible(false);

      if (onDownloadComplete) onDownloadComplete();
    } catch (error) {
      console.error("Download error:", error);

      // Clean up partial download
      try {
        const downloadPath = await getFilePath(reciter, surah.serial);
        await FileSystem.deleteAsync(downloadPath, { idempotent: true });
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }

      Alert.alert("ত্রুটি", "ডাউনলোড ব্যর্থ হয়েছে");
      setIsDownloading(false);
    }
  };

  const cancelDownload = async () => {
    if (downloadResumableRef.current) {
      try {
        await downloadResumableRef.current.pauseAsync?.();

        // Clean up partial download
        try {
          const downloadPath = await getFilePath(reciter, surah.serial);
          await FileSystem.deleteAsync(downloadPath, { idempotent: true });
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }

        downloadResumableRef.current = null;
      } catch (error) {
        console.error("Cancel download error:", error);
      }
    }
    setModalVisible(false);
    setIsDownloading(false);
    setDownloadProgress(0);
    if (onDownloadCancelled) onDownloadCancelled();
  };

  return (
    <Animated.View
      style={[
        styles.modalOverlay,
        {
          display: modalVisible ? "flex" : "none",
          opacity: fadeAnim,
        },
      ]}
    >
      <Pressable
        style={styles.modalOverlayPressable}
        onPress={() => !isDownloading && cancelDownload()}
      >
        <Animated.View
          style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalIconContainer}>
              <Ionicons
                name="musical-notes-outline"
                size={28}
                color="#037764"
              />
            </View>
            <Text style={styles.modalTitle}>সূরার অডিও ডাউনলোড করুন</Text>
            <Text style={styles.modalSubtitle}>
              সূরা {convertToBanglaNumbers(surah.serial)}: {surah.name_bn}
            </Text>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              এই সূরার অডিও আপনার ডিভাইসে নেই। শোনার জন্য প্রথমে ডাউনলোড করুন।
            </Text>

            <View style={styles.fileInfoContainer}>
              <View style={styles.fileInfoItem}>
                <Feather name="hard-drive" size={16} color="#555" />
                <Text style={styles.fileInfoText}>
                  সাইজ: {convertToBanglaNumbers(fileSizeMB || "~3.5")} MB
                </Text>
              </View>
              <View style={styles.fileInfoItem}>
                <Feather name="headphones" size={16} color="#555" />
                <Text style={styles.fileInfoText}>
                  {reciterName || `ক্বারী ${reciter}`}
                </Text>
              </View>
            </View>

            {isDownloading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>
                    ডাউনলোড হচ্ছে:{" "}
                    {(downloadProgress * (fileSizeMB || 3.5)).toFixed(1)}MB /{" "}
                    {fileSizeMB || "~3.5"}MB
                  </Text>
                  <Text style={styles.progressPercent}>
                    {(downloadProgress * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${downloadProgress * 100}%`,
                        backgroundColor: "#037764",
                      },
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
                isDownloading && styles.buttonDisabled,
              ]}
              onPress={cancelDownload}
            >
              <Text style={styles.cancelButtonText}>বাতিল</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                styles.downloadButton,
                pressed && styles.buttonPressed,
                isDownloading && styles.buttonDisabled,
              ]}
              onPress={handleDownload}
              disabled={!hasInternet || isDownloading}
            >
              <Text style={styles.downloadButtonText}>
                {isDownloading ? (
                  <>
                    <Ionicons name="cloud-download" size={16} color="white" />{" "}
                    ডাউনলোড হচ্ছে...
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-download" size={16} color="white" />{" "}
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

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalOverlayPressable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width - 40,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e6f7f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "bangla_bold",
    textAlign: "center",
    color: "#037764",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: "bangla_bold",
    textAlign: "center",
    color: "#555",
  },
  modalBody: {
    padding: 24,
    paddingTop: 16,
  },
  modalText: {
    textAlign: "center",
    color: "#555",
    fontFamily: "bangla_regular",
    marginBottom: 16,
    lineHeight: 22,
  },
  fileInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  fileInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1efefff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  fileInfoText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#555",
    fontFamily: "bangla_regular",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressText: {
    fontSize: 13,
    color: "#666",
    fontFamily: "bangla_regular",
  },
  progressPercent: {
    fontSize: 13,
    fontFamily: "bangla_bold",
    color: "#037764",
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  modalFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#555",
    fontFamily: "bangla_bold",
  },
  downloadButton: {
    backgroundColor: "#037764",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: "white",
    fontFamily: "bangla_bold",
    marginLeft: 6,
  },
});
