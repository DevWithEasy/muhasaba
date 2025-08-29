import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import SalahCalculation from "./SalahCalculation";

const APP_DIR = FileSystem.documentDirectory + "app_dir";

export default function Calculation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const data_files = {
    user: "user_data.json",
    salah: "salah_data.json",
    quran: "quran_data.json",
    hadith: "hadith_data.json",
    darood: "darood_data.json",
    istighfar: "istighfar_data.json",
    tasbih: "tasbih_data.json",
    friday: "friday_data.json",
    goodBadJob: "good_bad_job_data.json",
    donation: "donation_data.json",
  };

  const checkFiles = async () => {
    try {
      // First, check if the app directory exists
      const dirInfo = await FileSystem.getInfoAsync(APP_DIR);
      
      if (!dirInfo.exists) {
        setError("App directory not found");
        setLoading(false);
        return;
      }

      // Check each file and organize data by type
      const filesData = {};
      
      await Promise.all(
        Object.entries(data_files).map(async ([key, filename]) => {
          const filePath = `${APP_DIR}/${filename}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          
          if (fileInfo.exists) {
            try {
              const fileContent = await FileSystem.readAsStringAsync(filePath);
              filesData[key] = JSON.parse(fileContent);
            } catch (parseError) {
              console.error(`Error parsing ${filename}:`, parseError);
              filesData[key] = [];
            }
          } else {
            filesData[key] = [];
          }
        })
      );

      setData(filesData);
    } catch (err) {
      setError(err.message);
      console.error("Error checking files:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    checkFiles();
  }, []))

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading file information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SalahCalculation user={data.user} salah={data.salah}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  error: {
    color: 'red',
  },
  dataSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  }
});