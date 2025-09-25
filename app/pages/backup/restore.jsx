// Restore.js (আপডেটেড)
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

const SIGNATURE = "MUHASABA_APP_BACKUP_SIGNATURE";

export default function Restore() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidFile, setIsValidFile] = useState(null); // null = no file, true/false = validation result
  const [unzippedFiles, setUnzippedFiles] = useState(null);
  const router = useRouter();

  const validateBackupSignature = (files) => {
    // Check if the signature file exists and contains expected signature text
    if (!files["app_signature.txt"]) return false;
    const fileData = Buffer.from(files["app_signature.txt"]).toString("utf-8");
    return fileData === SIGNATURE;
  };

  const handleFilePick = async () => {
    try {
      setIsProcessing(true);
      setIsValidFile(null);
      setUnzippedFiles(null);

      // 1. Pick the ZIP file
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/zip",
        copyToCacheDirectory: true,
      });

      if (result.type === "cancel") {
        setIsProcessing(false);
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

      // 4. Unzip files
      const unzipped = await new Promise((resolve, reject) => {
        unzip(uint8Array, (err, unzippedFiles) => {
          if (err) return reject(err);
          resolve(unzippedFiles);
        });
      });

      // 5. Validate Signature
      const isValid = validateBackupSignature(unzipped);
      setIsValidFile(isValid);

      if (isValid) {
        setUnzippedFiles(unzipped);
      } else {
        Alert.alert(
          "অবৈধ ফাইল",
          "এই ফাইলটি আপনার অ্যাপের জন্য বৈধ ব্যাকআপ ফাইল নয়। দয়া করে সঠিক ফাইল নির্বাচন করুন।"
        );
      }
    } catch (error) {
      console.error("Error unzipping file:", error);
      Alert.alert("ত্রুটি", `ফাইল আনজিপ করতে ব্যর্থ হয়েছে: ${error.message}`);
      setIsValidFile(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    if (!unzippedFiles) return;
    setIsProcessing(true);

    try {
      const appDir = `${FileSystem.documentDirectory}app_dir`;
      const dirInfo = await FileSystem.getInfoAsync(appDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      }
      // Save all files except the signature file
      const savePromises = Object.entries(unzippedFiles)
        .filter(([filename]) => filename !== "app_signature.txt")
        .map(async ([filename, data]) => {
          const filePath = `${appDir}/${filename}`;
          await FileSystem.writeAsStringAsync(
            filePath,
            Buffer.from(data).toString("base64"),
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
        });

      await Promise.all(savePromises);

      Alert.alert("সফল", "ডেটা সফলভাবে রিস্টোর হয়েছে!");

      await AsyncStorage.setItem("is-first-install", "1");
      router.push("/");
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert("ত্রুটি", "ডেটা রিস্টোর করতে ব্যর্থ হয়েছে");
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
          onPress={handleFilePick}
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

        {isValidFile === true && (
          <TouchableOpacity
            style={[styles.button, styles.restoreButton, isProcessing && styles.buttonDisabled]}
            onPress={handleRestore}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>রিস্টোর করুন</Text>
            )}
          </TouchableOpacity>
        )}

        {isValidFile === false && (
          <Text style={styles.errorText}>
            নির্বাচিত ফাইলটি বৈধ নয়। অন্য একটি ফাইল নির্বাচন করুন।
          </Text>
        )}

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
    marginBottom: 16,
    shadowColor: "#6a11cb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  restoreButton: {
    backgroundColor: "#28a745",
    shadowColor: "#28a745",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontFamily: "bangla_medium",
    marginLeft: 10,
  },
  errorText: {
    color: "red",
    fontFamily: "bangla_medium",
    marginBottom: 16,
  },
  note: {
    fontFamily : 'bangla_regular',
    fontSize: 12,
    color: "#adb5bd",
    textAlign: "center",
    marginTop: 16,
  },
});
