import { Buffer } from "buffer";
import * as FileSystem from 'expo-file-system';
import { useRouter } from "expo-router";
import { unzipSync } from "fflate";
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import categories from "../../../../assets/data/category.json";

const DUA_DIR = FileSystem.documentDirectory+'app_dir/dua';
const DUA_URL = `https://cdn.jsdelivr.net/gh/DevWithEasy/app-file-store-repo/dua/dua_data.zip`;
const FILE_SIZE = 0.32; // MB

// ইউটিলিটি ফাংশন
const enToBnNumber = (number) => {
  const bnNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return number.toString().replace(/\d/g, (digit) => bnNumbers[digit]);
};

const files = [
    'dua.json',
    'sub_category.json',
]

// HomeScreen কম্পোনেন্ট
export default function Index () {
  const router = useRouter();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isCheckingFiles, setIsCheckingFiles] = useState(false);

  // ফাইল চেক করার ফাংশন
  const checkFilesExist = async () => {
    setIsCheckingFiles(true);
    try {
      // ডিরেক্টরি চেক করুন
      const dirInfo = await FileSystem.getInfoAsync(DUA_DIR);
      if (!dirInfo.exists) {
        return false;
      }

      // সব ফাইল চেক করুন
      for (const file of files) {
        const filePath = `${DUA_DIR}/${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (!fileInfo.exists) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("ফাইল চেক করার সময় ত্রুটি:", error);
      return false;
    } finally {
      setIsCheckingFiles(false);
    }
  };

  // ডাউনলোড ফাংশন
  const startDownload = async () => {
    try {
      // Create base directory if it doesn't exist
      await FileSystem.makeDirectoryAsync(DUA_DIR, { intermediates: true });

      const downloadResumable = FileSystem.createDownloadResumable(
        DUA_URL,
        `${DUA_DIR}/dua_data.zip`,
        {},
        (downloadProgress) => {
          const progressFraction =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progressFraction);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      // Extract zip file
      const fileData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const buffer = Buffer.from(fileData, "base64");
      const files = unzipSync(buffer);

      // Process files in specific order to ensure directories are created first
      const fileEntries = Object.entries(files);

      // First pass: Create all directories
      for (const [fileName, content] of fileEntries) {
        if (fileName.endsWith("/")) {
          // This is a directory
          const dirPath = `${DUA_DIR}/${fileName}`;
          await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        }
      }

      // Second pass: Write all files
      for (const [fileName, content] of fileEntries) {
        if (!fileName.endsWith("/")) {
          // Skip directories
          const path = `${DUA_DIR}/${fileName}`;

          // Ensure parent directories exist
          const pathParts = fileName.split("/");
          if (pathParts.length > 1) {
            const dirPath = `${DUA_DIR}/${pathParts.slice(0, -1).join("/")}`;
            await FileSystem.makeDirectoryAsync(dirPath, {
              intermediates: true,
            });
          }

          // Write file content
          await FileSystem.writeAsStringAsync(
            path,
            Buffer.from(content).toString(),
            { encoding: FileSystem.EncodingType.UTF8 }
          );
        }
      }

      // Clean up the zip file
      await FileSystem.deleteAsync(uri);

      setShowDownloadModal(false);
      Alert.alert("সফল!", "দোয়া ডাটা সফলভাবে ডাউনলোড হয়েছে");
    } catch (err) {
      console.log("Download error:", err);
      await FileSystem.deleteAsync(DUA_DIR, { idempotent: true });
      Alert.alert("ডাউনলোড ব্যর্থ হয়েছে", "অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  const navigateToSubCategory = async (category) => {
    // প্রথমে ফাইল চেক করুন
    const filesExist = await checkFilesExist();
    
    if (!filesExist) {
      // ফাইল না থাকলে মডাল দেখান
      setShowDownloadModal(true);
      return;
    }
    
    // ফাইল থাকলে নেভিগেট করুন
    router.push({
      pathname: "/pages/education/dua/sub-category",
      params: {
        cateName: category.cat_name_bn,
        catId: category.cat_id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => navigateToSubCategory(category)}
              disabled={isCheckingFiles}
            >
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {category.cat_name_bn}
                </Text>
                <Text style={styles.subCategoryCount}>
                  সাব-ক্যাটাগরি -{" "}
                  {enToBnNumber(category.no_of_subcat.toString())} টি
                </Text>
              </View>
              <View style={styles.duaCountContainer}>
                <Text style={styles.duaCount}>
                  {enToBnNumber(category.no_of_dua.toString())}
                </Text>
                <Text style={styles.duaLabel}>দোয়া</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ডাউনলোড মডাল */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDownloadModal}
        onRequestClose={() => setShowDownloadModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>দোয়া ডাটা ডাউনলোড</Text>
            <Text style={styles.modalText}>
              দোয়া ডাটা ডাউনলোড করা প্রয়োজন। ইন্টারনেট সংযোগ থাকা অবস্থায় ডাউনলোড করুন।
            </Text>
            
            <Text style={styles.fileSizeText}>
              ফাইলের আকার: {FILE_SIZE} এমবি
            </Text>
            
            {downloadProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      {width: `${downloadProgress * 100}%`}
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(downloadProgress * 100)}% ডাউনলোড হয়েছে
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setShowDownloadModal(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonDownload]}
                onPress={startDownload}
                disabled={downloadProgress > 0}
              >
                <Text style={styles.buttonText}>
                  {downloadProgress > 0 ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড করুন'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    padding: 12,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0.8,
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 20,
  },
  categoryName: {
    marginBottom: 4,
    fontFamily: "bangla_medium",
    color: "#138d75",
  },
  subCategoryCount: {
    color: "#888",
    fontSize: 12,
    fontFamily: "bangla_regular",
  },
  duaCountContainer: {
    width: 70,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
    paddingLeft: 12,
  },
  duaCount: {
    marginBottom: 4,
    fontFamily: "bangla_semibold",
    color: "#138d75",
  },
  duaLabel: {
    color: "#888",
    fontSize: 14,
    fontFamily: "bangla_regular",
  },
  // মডাল স্টাইল
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "bangla_bold",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "bangla_regular",
  },
  fileSizeText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "bangla_medium",
    color: "#555",
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00897B',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
    fontFamily: "bangla_medium",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '100%',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    minWidth: 120,
  },
  buttonCancel: {
    backgroundColor: "#f44336",
    marginRight: 10,
  },
  buttonDownload: {
    backgroundColor: "#00897B",
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "bangla_medium",
  },
});