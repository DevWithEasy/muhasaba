import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as fflate from "fflate";
import { useState } from "react";
import { Alert, Button, Platform, Share, Text, View } from "react-native";

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

  // Create backup directory if it doesn't exist
  const ensureBackupDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
    }
  };

  // Create a zip backup of all files
  const createBackup = async () => {
    setIsProcessing(true);
    try {
      await ensureBackupDirExists();

      // Read all files
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
          "Warning",
          "Some files couldn't be read, backup may be incomplete"
        );
      }

      // Create zip file
      const zipData = fflate.zipSync(fileContents);
      const zipBuffer = Buffer.from(zipData.buffer);
      const zipFileName = `muhasaba_app_backup.zip`;
      const zipPath = `${BACKUP_DIR}/${zipFileName}`;

      // Save zip file
      await FileSystem.writeAsStringAsync(zipPath, zipBuffer.toString("base64"), {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert("Success", "Backup created successfully!");
      return zipPath;
    } catch (error) {
      console.error("Backup error:", error);
      Alert.alert("Error", "Failed to create backup");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Share the backup file
  const shareBackup = async () => {
    const zipPath = await createBackup();
    if (!zipPath) return;

    try {
      if (Platform.OS === "android") {
        // On Android, we need to make the file readable
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      }

      await Sharing.shareAsync(zipPath, {
        mimeType: "application/zip",
        dialogTitle: "Share App Backup",
        UTI: "public.zip-archive",
      });
    } catch (error) {
      console.error("Sharing error:", error);
      Alert.alert("Error", "Failed to share backup");
    }
  };

  // Save backup to device storage
  const saveBackupToDevice = async () => {
    setIsProcessing(true);
    try {
      const zipPath = await createBackup();
      if (!zipPath) return;

      if (Platform.OS === 'android') {
        // Request permission to access storage
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (!permissions.granted) {
          Alert.alert("Permission required", "Please grant permission to save the backup");
          return;
        }

        // Read the backup file
        const base64Content = await FileSystem.readAsStringAsync(zipPath, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Create the file in the selected directory
        const fileName = zipPath.split('/').pop();
        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/zip'
        );
        
        // Write the file
        await FileSystem.writeAsStringAsync(newUri, base64Content, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert("Success", `Backup saved to device as ${fileName}`);
      } else if (Platform.OS === 'ios') {
        // For iOS, we'll use the share dialog to let user save to Files app
        const result = await Share.share({
          url: zipPath,
          title: 'Save Backup',
          type: 'application/zip',
          options: {
            dialogTitle: 'Save Backup to Files',
            UTI: 'public.zip-archive'
          }
        });

        if (result.action === Share.sharedAction) {
          Alert.alert("Success", "Backup saved successfully");
        } else if (result.action === Share.dismissedAction) {
          Alert.alert("Info", "Backup save cancelled");
        }
      }
    } catch (error) {
      console.error("Save to device error:", error);
      Alert.alert("Error", "Failed to save backup to device");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Backup & Restore</Text>
      
      <Button
        title="Create & Share Backup"
        onPress={shareBackup}
        disabled={isProcessing}
      />
      
      <View style={{ marginTop: 10 }}>
        <Button
          title="Save Backup to Device"
          onPress={saveBackupToDevice}
          disabled={isProcessing}
        />
      </View>
      
      {isProcessing && <Text style={{ marginTop: 20 }}>Processing...</Text>}
    </View>
  );
}