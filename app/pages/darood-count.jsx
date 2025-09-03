import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

const { width } = Dimensions.get("window");

const daroods = [
  {
    id: 1,
    name: "darood_ibrahim",
    ar: "اَللّهُمَّ صَلِّ عَلى مُحَمَّدٍ ...",
    bn: "আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিওঁ ...",
    meaning: "হে আল্লাহ, হযরত মুহাম্মদ (সাঃ) এবং তাঁর বংশধরের উপর শান্তি...",
  },
];

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/darood_data.json`;

// ✅ update darood count in JSON
async function updateDaroodCount(date, daroodType, newCount) {
  try {
    const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const data = JSON.parse(fileContent);

    const existingIndex = data.findIndex((item) => item.date === date);
    if (existingIndex >= 0) {
      data[existingIndex].count[daroodType] = newCount;
    } else {
      const newEntry = {
        date,
        count: {
          [daroodType]: newCount,
        },
      };
      data.push(newEntry);
    }

    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify(data));
  } catch (error) {
    console.error("Error updating darood count:", error);
  }
}

// ✅ play short sound effect
async function playClickSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/audio/click.wav")
    );
    await sound.playAsync();
    // unload after play
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log("Sound play error:", error);
  }
}

export default function DaroodCount() {
  const params = useLocalSearchParams();
  const { daroodType, date, currentCount } = params;
  const [count, setCount] = useState(Number(currentCount) || 0);
  const [modalVisible, setModalVisible] = useState(false);
  const currentDarood = daroods.find((item) => item.name === daroodType);
  const [hapticAction, setHapticOption] = useState("volume"); // volume | silent | vibrate

  const handleHapticAction = () => {
    if (hapticAction === "volume") {
      setHapticOption("silent");
    } else if (hapticAction === "silent") {
      setHapticOption("vibrate");
    } else {
      setHapticOption("volume");
    }
  };

  // ✅ count increment with hapticAction
  const handleIncrement = async () => {
    const newCount = count + 1;
    setCount(newCount);
    await updateDaroodCount(date, daroodType, newCount);

    // Handle haptic / sound
    if (hapticAction === "volume") {
      await playClickSound();
    } else if (hapticAction === "vibrate") {
      if (Platform.OS === "ios") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Vibration.vibrate([0, 75, 0, 0]); 
      }
    }
  };

  const handleDecrement = async () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      await updateDaroodCount(date, daroodType, newCount);
    }
  };

  const handleReset = async () => {
    setCount(0);
    await updateDaroodCount(date, daroodType, 0);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={handleHapticAction}
              style={{ marginRight: 4 }}
            >
              {hapticAction === "volume" ? (
                <Ionicons name="volume-high" size={24} color="#037764" />
              ) : hapticAction === "silent" ? (
                <Ionicons name="volume-mute" size={24} color="#037764" />
              ) : (
                <MaterialIcons name="vibration" size={24} color="#037764" />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      {/* Header with Darood name */}
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text numberOfLines={1} style={styles.headerText}>
          {currentDarood.bn}
        </Text>
      </TouchableOpacity>

      {/* Main counter area */}
      <TouchableOpacity
        style={styles.counterArea}
        onPress={handleIncrement}
        activeOpacity={0.8}
      >
        <View style={styles.counterCircle}>
          <Text
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            style={styles.countText}
          >
            {convertToBanglaNumbers(count)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Fixed action buttons at bottom */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.resetButton]}
          onPress={handleReset}
        >
          <Text style={styles.actionButtonText}>রিসেট</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.decrementButton]}
          onPress={handleDecrement}
          disabled={count === 0}
        >
          <Text style={styles.actionButtonText}>কমাই</Text>
        </TouchableOpacity>
      </View>

      {/* Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.arabicText}>{currentDarood.ar}</Text>
            <Text style={styles.banglaText}>{currentDarood.bn}</Text>
            <Text style={styles.meaningText}>{currentDarood.meaning}</Text>

            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>বন্ধ করুন</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  headerButton: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#037764",
    shadowColor: "#037764",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerText: {
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#037764",
    textAlign: "center",
  },
  counterArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  counterCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.35,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#037764",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  countText: {
    fontFamily: "bangla_bold",
    fontSize: 45,
    color: "#037764",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    elevation: 2,
  },
  resetButton: { backgroundColor: "#e53e3e" },
  decrementButton: { backgroundColor: "#f6ad55" },
  actionButtonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  arabicText: {
    fontFamily: "arabic_regular",
    fontSize: 24,
    textAlign: "right",
    lineHeight: 40,
    marginBottom: 20,
    color: "#037764",
  },
  banglaText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  meaningText: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    lineHeight: 22,
    color: "#4a5568",
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: "#037764",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontFamily: "bangla_medium",
    color: "white",
    fontSize: 16,
  },
});
