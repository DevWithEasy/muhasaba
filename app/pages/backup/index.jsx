import { Ionicons } from "@expo/vector-icons";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as fflate from "fflate";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const APP_DIR = FileSystem.documentDirectory + "app_dir";
const BACKUP_DIR = FileSystem.documentDirectory + "backups";

export default function Backup() {
  const [isProcessing, setIsProcessing] = useState(false);

  const files = [
    "user_data.json",
    "salah_data.json",
    "quran_data.json",
    "hadith_data.json",
    "darood_data.json",
    "istighfar_data.json",
    "tasbih_data.json",
    "friday_data.json",
    "good_bad_job_data.json",
    "donation_data.json",
    "todo_data.json",
  ].map((name) => `${APP_DIR}/${name}`);

  const ensureBackupDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
    }
  };

  const createBackup = async () => {
    setIsProcessing(true);
    try {
      await ensureBackupDirExists();

      const fileContents = {};
      let hasError = false;

      for (const filePath of files) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          if (fileInfo.exists) {
            const content = await FileSystem.readAsStringAsync(filePath, {
              encoding: FileSystem.EncodingType.UTF8,
            });
            fileContents[filePath.split("/").pop()] = Buffer.from(content);
          }
        } catch (error) {
          console.error(`Error reading file ${filePath}:`, error);
          hasError = true;
        }
      }

      if (hasError) {
        Alert.alert(
          "সতর্কতা",
          "কিছু ফাইল পড়া যায়নি, ব্যাকআপটি অসম্পূর্ণ হতে পারে"
        );
      }

      const zipData = fflate.zipSync(fileContents);
      const zipBuffer = Buffer.from(zipData.buffer);
      const zipFileName = `muhasaba_app_backup.zip`;
      const zipPath = `${BACKUP_DIR}/${zipFileName}`;

      await FileSystem.writeAsStringAsync(zipPath, zipBuffer.toString("base64"), {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert("সফল", "ব্যাকআপ সফলভাবে তৈরি হয়েছে!");
      return zipPath;
    } catch (error) {
      console.error("Backup error:", error);
      Alert.alert("ত্রুটি", "ব্যাকআপ তৈরি করতে ব্যর্থ হয়েছে");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const shareBackup = async () => {
    const zipPath = await createBackup();
    if (!zipPath) return;

    try {
      await Sharing.shareAsync(zipPath, {
        mimeType: "application/zip",
        dialogTitle: "অ্যাপ ব্যাকআপ শেয়ার করুন",
        UTI: "public.zip-archive",
      });
    } catch (error) {
      console.error("Sharing error:", error);
      Alert.alert("ত্রুটি", "ব্যাকআপ শেয়ার করতে ব্যর্থ হয়েছে");
    }
  };

  const saveBackupToDevice = async () => {
    setIsProcessing(true);
    try {
      const zipPath = await createBackup();
      if (!zipPath) return;

      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (!permissions.granted) {
          Alert.alert("অনুমতি প্রয়োজন", "ব্যাকআপ সংরক্ষণ করতে অনুগ্রহ করে অনুমতি দিন");
          return;
        }

        const base64Content = await FileSystem.readAsStringAsync(zipPath, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const fileName = zipPath.split('/').pop();
        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/zip'
        );
        
        await FileSystem.writeAsStringAsync(newUri, base64Content, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert("সফল", `${fileName} নামে ডিভাইসে ব্যাকআপ সংরক্ষণ করা হয়েছে`);
      } else if (Platform.OS === 'ios') {
        const result = await Share.share({
          url: zipPath,
          title: 'ব্যাকআপ সংরক্ষণ করুন',
          type: 'application/zip',
          options: {
            dialogTitle: 'ফাইলস অ্যাপে ব্যাকআপ সংরক্ষণ করুন',
            UTI: 'public.zip-archive'
          }
        });

        if (result.action === Share.sharedAction) {
          Alert.alert("সফল", "ব্যাকআপ সফলভাবে সংরক্ষণ করা হয়েছে");
        } else if (result.action === Share.dismissedAction) {
          Alert.alert("তথ্য", "ব্যাকআপ সংরক্ষণ বাতিল করা হয়েছে");
        }
      }
    } catch (error) {
      console.error("Save to device error:", error);
      Alert.alert("ত্রুটি", "ডিভাইসে ব্যাকআপ সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-download" size={36} color="#037764" />
          </View>
          <Text style={styles.title}>ডাটা ব্যাকআপ</Text>
          <Text style={styles.subtitle}>
            আপনার অ্যাপের সমস্ত ডেটা এবং সেটিংসের একটি ব্যাকআপ তৈরি করুন। 
            নিরাপদ স্থানে সংরক্ষণ করুন যাতে ভবিষ্যতে প্রয়োজন হলে পুনরুদ্ধার করতে পারেন।
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isProcessing && styles.buttonDisabled]}
          onPress={shareBackup}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="share-social" size={20} color="white" />
              <Text style={styles.buttonText}>শেয়ার করুন</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, isProcessing && styles.buttonDisabled]}
          onPress={saveBackupToDevice}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#037764" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#037764" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>ডিভাইসে সংরক্ষণ করুন</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          দ্রষ্টব্য: ব্যাকআপ ফাইলটি নিরাপদ স্থানে সংরক্ষণ করুন। এটি আপনার সমস্ত গুরুত্বপূর্ণ ডেটা ধারণ করে।
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
    padding: 20,
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
    fontFamily: 'bangla_regular',
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "90%",
    marginBottom: 24,
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
    shadowColor: "#037764",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#037764",
  },
  secondaryButtonText: {
    color: "#037764",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontFamily: "bangla_medium",
    marginLeft: 10,
    fontSize: 16,
  },
  note: {
    fontFamily: 'bangla_regular',
    fontSize: 12,
    color: "#adb5bd",
    textAlign: "center",
    marginTop: 24,
    maxWidth: "90%",
  },
});