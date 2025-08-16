import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import { Stack } from "expo-router";
import { unzipSync } from "fflate";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import surasData from "../../../assets/data/surah.json";
import QuranDownloadModal from "../../../components/quran/QuranDownloadModal";
import SuraItem from "../../../components/quran/SuraItem";
import SuraLoadingScreen from "../../../components/quran/SuraLoadingScreen";

const QURAN_URL = `https://cdn.jsdelivr.net/gh/DevWithEasy/app-file-store-repo/quran/quran_data.zip`;
const QURAN_DIR = `${FileSystem.documentDirectory}app_dir/quran`;
const FILE_SIZE = 2.34; // MB

export default function Quran() {
  const [surahs, setSurahs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(QURAN_DIR);
        setSurahs(surasData);
        setDataLoading(false);

        if (!fileInfo.exists) {
          setShowDownloadModal(true);
          return;
        }
      } catch (error) {
        console.error("DB error:", error);
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSurahs([]);
      return;
    }

    const filtered = surasData.filter(
      (surah) =>
        surah.name_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.meaning_bn.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSurahs(filtered);
  }, [searchQuery]);

  const startDownload = async () => {
    try {
      // Create base directory if it doesn't exist
      await FileSystem.makeDirectoryAsync(QURAN_DIR, { intermediates: true });

      const downloadResumable = FileSystem.createDownloadResumable(
        QURAN_URL,
        `${QURAN_DIR}/quran_data.zip`,
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
          const dirPath = `${QURAN_DIR}/${fileName}`;
          await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        }
      }

      // Second pass: Write all files
      for (const [fileName, content] of fileEntries) {
        if (!fileName.endsWith("/")) {
          // Skip directories
          const path = `${QURAN_DIR}/${fileName}`;

          // Ensure parent directories exist
          const pathParts = fileName.split("/");
          if (pathParts.length > 1) {
            const dirPath = `${QURAN_DIR}/${pathParts.slice(0, -1).join("/")}`;
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
      Alert.alert("সফল!", "কুরআন ডাটা সফলভাবে ডাউনলোড হয়েছে");
    } catch (err) {
      console.log("Download error:", err);
      await FileSystem.deleteAsync(QURAN_DIR, { idempotent: true });
      Alert.alert("ডাউনলোড ব্যর্থ হয়েছে", "অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  if (dataLoading) {
    return <SuraLoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "কুরআন মাজিদ",
          headerSearchBarOptions: {
            placeholder: "সূরা খুঁজুন",
            onChangeText: (event) => setSearchQuery(event.nativeEvent.text),
            hideWhenScrolling: false,
            barTintColor: "#f5f5f5",
            tintColor: "#037764",
            textColor: "#333",
            headerIconColor: "#037764",
          },
        }}
      />
      <FlatList
        data={filteredSurahs.length > 0 ? filteredSurahs : surahs}
        renderItem={({ item }) => (
          <SuraItem
            key={item.serial}
            item={item}
            showModal={showDownloadModal}
            setShowModal={setShowDownloadModal}
          />
        )}
        keyExtractor={(item) => item.serial.toString()}
        contentContainerStyle={styles.listContent}
      />

      <QuranDownloadModal
        showModal={showDownloadModal}
        setShowModal={setShowDownloadModal}
        bookId="quran"
        bookName="কুরআন শরীফ"
        fileSize={FILE_SIZE}
        suraCount={114}
        colorCode="#037764"
        onDownload={startDownload}
        progress={downloadProgress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
});
