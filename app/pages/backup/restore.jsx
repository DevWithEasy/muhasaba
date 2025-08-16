import { View, Text, Button, Alert, Platform } from 'react-native';
import React, { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { unzip } from 'fflate';
import * as DocumentPicker from 'expo-document-picker';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Restore() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleUnzip = async () => {
    try {
      setIsProcessing(true);
      
      // 1. Pick the ZIP file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
        copyToCacheDirectory: true,
      });
      
      console.log('Document picker result:', result); // Debug log

      if (result.type === 'cancel') {
        return;
      }

      // Handle different versions of expo-document-picker
      const fileUri = result.uri || result.fileUri || result.assets?.[0]?.uri;
      if (!fileUri) {
        throw new Error('No valid file URI found in the document picker result');
      }

      // 2. Read the file content
      let finalUri = fileUri;
      
      // For Android content URIs, copy to cache first
      if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
        const fileName = result.name || result.assets?.[0]?.name || 'temp.zip';
        const cacheFileUri = `${FileSystem.cacheDirectory}${fileName}`;
        
        await FileSystem.makeDirectoryAsync(FileSystem.cacheDirectory, { intermediates: true });
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
      const buffer = Buffer.from(fileContent, 'base64');
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
          
          const savePromises = Object.entries(unzipped).map(async ([filename, data]) => {
            const filePath = `${appDir}/${filename}`;
            await FileSystem.writeAsStringAsync(filePath, Buffer.from(data).toString('base64'), {
              encoding: FileSystem.EncodingType.Base64,
            });
          });
          
          Promise.all(savePromises).then(resolve).catch(reject);
        });
      });

      Alert.alert('Success', 'Files have been extracted successfully!');
      await AsyncStorage.setItem("is-first-install", "1");
      router.push("/");
    } catch (error) {
      console.error('Error unzipping file:', error);
      Alert.alert('Error', `Failed to extract files: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Restore Backup</Text>
      <Button
        title="Select and Unzip File"
        onPress={handleUnzip}
        disabled={isProcessing}
      />
      {isProcessing && <Text>Processing...</Text>}
    </View>
  );
}