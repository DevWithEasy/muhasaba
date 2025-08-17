import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PrayerTimeView from "../../components/PrayerTimeView";

export default function Index() {
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      Alert.alert(
        "Confirm Reset",
        "Are you sure you want to clear all app data? This cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsClearing(false),
          },
          {
            text: "Clear All",
            style: "destructive",
            onPress: async () => {
              try {
                // Clear AsyncStorage
                await AsyncStorage.clear();

                // Delete app directory and files
                const appDir = `${FileSystem.documentDirectory}app_dir`;
                const dirInfo = await FileSystem.getInfoAsync(appDir);

                if (dirInfo.exists) {
                  await FileSystem.deleteAsync(appDir, { idempotent: true });
                }
                router.push('/')
              } catch (error) {
                console.error("Error clearing data:", error);
                Alert.alert("Error", "Failed to clear all data");
              } finally {
                setIsClearing(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error showing alert:", error);
      setIsClearing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc", padding: 10 }}>
      <PrayerTimeView />

      <TouchableOpacity
        style={styles.clearButton}
        onPress={handleClearAllData}
        disabled={isClearing}
      >
        <Text style={styles.clearButtonText}>
          {isClearing ? "Clearing..." : "Clear All App Data"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ff4444",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    elevation: 3,
  },
  clearButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
