import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { unzip } from "fflate";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function Restore() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleUnzip = async () => {
    try {
      setIsProcessing(true);

      // 1. Pick the ZIP file
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/zip",
        copyToCacheDirectory: true,
      });

      if (result.type === "cancel") {
        return;
      }

      const fileUri = result.uri || result.fileUri || result.assets?.[0]?.uri;
      if (!fileUri) {
        throw new Error(
          "No valid file URI found in the document picker result"
        );
      }

      // 2. Read the file content
      let finalUri = fileUri;

      if (Platform.OS === "android" && fileUri.startsWith("content://")) {
        const fileName = result.name || result.assets?.[0]?.name || "temp.zip";
        const cacheFileUri = `${FileSystem.cacheDirectory}${fileName}`;

        await FileSystem.makeDirectoryAsync(FileSystem.cacheDirectory, {
          intermediates: true,
        });
        await FileSystem.copyAsync({
          from: fileUri,
          to: cacheFileUri,
        });
        finalUri = cacheFileUri;
      }

      const fileContent = await FileSystem.readAsStringAsync(finalUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3. Convert to Uint8Array
      const buffer = Buffer.from(fileContent, "base64");
      const uint8Array = new Uint8Array(buffer);

      // 4. Create app directory
      const appDir = `${FileSystem.documentDirectory}app_dir`;
      const dirInfo = await FileSystem.getInfoAsync(appDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      }

      // 5. Unzip using fflate
      await new Promise((resolve, reject) => {
        unzip(uint8Array, (err, unzipped) => {
          if (err) return reject(err);

          const savePromises = Object.entries(unzipped).map(
            async ([filename, data]) => {
              const filePath = `${appDir}/${filename}`;
              await FileSystem.writeAsStringAsync(
                filePath,
                Buffer.from(data).toString("base64"),
                {
                  encoding: FileSystem.EncodingType.Base64,
                }
              );
            }
          );

          Promise.all(savePromises).then(resolve).catch(reject);
        });
      });

      Alert.alert("Success", "Files have been extracted successfully!");
      await AsyncStorage.setItem("is-first-install", "1");
      router.push("/");
    } catch (error) {
      console.error("Error unzipping file:", error);
      Alert.alert("Error", `Failed to extract files: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-upload" size={36} color="#037764" />
          </View>
          <Text style={styles.title}>রিস্টোর ডাটা</Text>
          <Text style={styles.subtitle}>
            আপনার অ্যাপের সমস্ত ডেটা এবং সেটিংস পুনরুদ্ধার করতে আপনার ব্যাকআপ
            ফাইলটি নির্বাচন করুন। আপনি যেন একটি বিশ্বস্ত উৎস থেকে পুনরুদ্ধার
            করছেন, তা নিশ্চিত করুন।
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isProcessing && styles.buttonDisabled]}
          onPress={handleUnzip}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="folder-open" size={20} color="white" />
              <Text style={styles.buttonText}>ব্যাকআপ ফাইল নির্বাচন করুন</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          দ্রষ্টব্য: এটি আপনার বর্তমান ডেটা মুছে ফেলবে। প্রয়োজনে আপনার কাছে একটি ব্যাকআপ আছে কিনা, তা নিশ্চিত করুন।
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    backgroundColor: "white",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e9ecef",
    marginBottom: 16,
    shadowColor: "#037764",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontFamily: "bangla_bold",
    color: "#037764",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily : 'bangla_regular',
    color: "#6c757d",
    lineHeight: 24,
    maxWidth: "90%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#037764",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    maxWidth: 300,
    marginBottom: 24,
    shadowColor: "#6a11cb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontFamily: "bangla_medium",
    marginLeft: 10,
  },
  note: {
    fontFamily : 'bangla_regular',
    fontSize: 12,
    color: "#adb5bd",
    textAlign: "center",
    marginTop: 16,
  },
});
