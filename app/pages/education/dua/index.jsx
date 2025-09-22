import { Buffer } from "buffer";
import * as FileSystem from 'expo-file-system';
import { useRouter } from "expo-router";
import { unzipSync } from "fflate";
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import categories from "../../../../assets/data/category.json";
import DuaDownloadModal from "../../../../components/dua/DuaDownloadModal"; // নতুন কম্পোনেন্ট ইম্পোর্ট

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

export default function Index () {
  const router = useRouter();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isCheckingFiles, setIsCheckingFiles] = useState(false);

  const checkFilesExist = async () => {
    setIsCheckingFiles(true);
    try {
      const dirInfo = await FileSystem.getInfoAsync(DUA_DIR);
      if (!dirInfo.exists) {
        return false;
      }

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

  const startDownload = async () => {
    try {
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

      const fileData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const buffer = Buffer.from(fileData, "base64");
      const files = unzipSync(buffer);

      const fileEntries = Object.entries(files);

      for (const [fileName, content] of fileEntries) {
        if (fileName.endsWith("/")) {
          const dirPath = `${DUA_DIR}/${fileName}`;
          await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        }
      }

      for (const [fileName, content] of fileEntries) {
        if (!fileName.endsWith("/")) {
          const path = `${DUA_DIR}/${fileName}`;
          const pathParts = fileName.split("/");
          if (pathParts.length > 1) {
            const dirPath = `${DUA_DIR}/${pathParts.slice(0, -1).join("/")}`;
            await FileSystem.makeDirectoryAsync(dirPath, {
              intermediates: true,
            });
          }

          await FileSystem.writeAsStringAsync(
            path,
            Buffer.from(content).toString(),
            { encoding: FileSystem.EncodingType.UTF8 }
          );
        }
      }

      await FileSystem.deleteAsync(uri);

      setShowDownloadModal(false);
      setDownloadProgress(0);
      Alert.alert("সফল!", "দোয়া ডাটা সফলভাবে ডাউনলোড হয়েছে");
    } catch (err) {
      console.log("Download error:", err);
      await FileSystem.deleteAsync(DUA_DIR, { idempotent: true });
      Alert.alert("ডাউনলোড ব্যর্থ হয়েছে", "অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  const navigateToSubCategory = async (category) => {
    const filesExist = await checkFilesExist();
    
    if (!filesExist) {
      setShowDownloadModal(true);
      return;
    }
    
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
                  সাব-ক্যাটাগরি - {enToBnNumber(category.no_of_subcat.toString())} টি
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

      {/* নতুন অ্যানিমেটেড ডাউনলোড মডাল */}
      <DuaDownloadModal
        showModal={showDownloadModal}
        setShowModal={setShowDownloadModal}
        bookName="দোয়া সংগ্রহ"
        fileSize={FILE_SIZE}
        itemCount={categories.reduce((total, cat) => total + cat.no_of_dua, 0)}
        colorCode="#00897B"
        onDownload={startDownload}
        progress={downloadProgress}
      />
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
});