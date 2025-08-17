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

const tasbihs = [
  {
    id: 1,
    name: "tasbih_1",
    ar: "الْحَمْدُ لِلَّهِ",
    bn: "আলহামদু লিল্লাহ",
    meaning: "সকল প্রশংসা আল্লাহরই",
  },
  {
    id: 2,
    name: "tasbih_2",
    ar: "سُبْحَانَ ٱللَّٰه",
    bn: "সুবহানাল্লাহ",
    meaning: "আল্লাহ তা'আলা সকল অপূর্ণতা ও দোষ থেকে পবিত্র\nনবী সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বললেন, 'যে ব্যক্তি ১০০ বার 'সুবহানাল্লাহ' বলবে, তার জন্য এক হাজার সওয়াব লেখা হবে অথবা তার এক হাজার পাপ মুছে ফেলা হবে।' মুসলিম ৪/২০৭৩, নং ২৬৯৮।",
  },
  {
    id: 3,
    name: "tasbih_3",
    ar: "لاَ إِلَهَ إِلاَّ اللَّ",
    bn: "লা ইলাহা ইল্লাল্লাহ",
    meaning: "আল্লাহ ব্যতীত কোনো হক্ব ইলাহ নেই। \nসর্বোত্তম যিক্‌র হল, তিরমিযী ৫/৪৬২, নং ৩৩৮৩;",
  },
  {
    id: 4,
    name: "tasbih_4",
    ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    bn: "সুব্‌হানাল্লা-হি ওয়াবিহামদিহী",
    meaning: "'আমি আল্লাহর সপ্রশংস পবিত্রতা ঘোষণা করছি',\nতার পাপসমূহ মুছে ফেলা হয়, যদিও তা সাগরের ফেনারাশির সমান হয়ে থাকে।' বুখারী ৭/১৬৮, নং ৬৪০৫; মুসলিম ৪/২০৭১, নং ২৬৯১",
  },
  {
    id: 5,
    name: "tasbih_5",
    ar: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    bn: "লা ইলা-হা ইল্লাল্লা-হু ওয়াহদাহু লা শারীকা লাহু লাহুল মুলকু ওয়া লাহুল হামদু ওয়া হুয়া 'আলা কুল্লি শাই'ইন ক্বাদীর",
    meaning: "'একমাত্র আল্লাহ ছাড়া কোনো হক্ব ইলাহ নেই, তাঁর কোনো শরীক নেই; রাজত্ব তাঁরই, সমস্ত প্রশংসাও তাঁর; আর তিনি সকল কিছুর উপর ক্ষমতাবান।'\nএটা তার জন্য এমন হবে যেন সে ইসমাঈলের সন্তানদের চারজনকে দাসত্ব থেকে মুক্ত করল।' বুখারী ৭/৬৭ নং ৬৪০৪;",
  },
  {
    id: 6,
    name: "tasbih_6",
    ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحانَ اللَّهِ الْعَظِيمِ",
    bn: "সুব্‌হানাল্লা-হি ওয়া বিহামদিহী, সুব্‌হানাল্লা-হিল 'আযীম",
    meaning: "আল্লাহ্‌র প্রশংসাসহকারে তাঁর পবিত্রতা ও মহিমা বর্ণনা করছি। মহান আল্লাহর পবিত্রতা ও মহিমা ঘোষণা করছি।' বুখারী ৭/১৬৮, নং ৬৪০৪",
  },
];

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/tasbih_data.json`;

// ✅ update tasbih count in JSON
async function updateTasbihCount(date, tasbihType, newCount) {
  try {
    const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const data = JSON.parse(fileContent);

    const existingIndex = data.findIndex((item) => item.date === date);
    if (existingIndex >= 0) {
      data[existingIndex].count[tasbihType] = newCount;
    } else {
      const newEntry = {
        date,
        count: {
          [tasbihType]: newCount,
        },
      };
      data.push(newEntry);
    }

    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify(data));
  } catch (error) {
    console.error("Error updating tasbih count:", error);
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

export default function TasbihCount() {
  const params = useLocalSearchParams();
  const { tasbihType, date, currentCount, target } = params;
  const [count, setCount] = useState(Number(currentCount) || 0);
  const [modalVisible, setModalVisible] = useState(false);
  const currentTasbih = tasbihs.find((item) => item.name === tasbihType);
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
    await updateTasbihCount(date, tasbihType, newCount);

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
      await updateTasbihCount(date, tasbihType, newCount);
    }
  };

  const handleReset = async () => {
    setCount(0);
    await updateTasbihCount(date, tasbihType, 0);
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
      
      {/* Header with Tasbih name */}
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text numberOfLines={1} style={styles.headerText}>
          {currentTasbih.bn}
        </Text>
      </TouchableOpacity>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {convertToBanglaNumbers(count)}/{convertToBanglaNumbers(target)}
        </Text>
      </View>

      {/* Main counter area */}
      <TouchableOpacity 
        style={styles.counterArea} 
        onPress={handleIncrement}
        activeOpacity={0.8}
      >
        <View style={styles.counterCircle}>
          <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.countText}>
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
            <Text style={styles.arabicText}>{currentTasbih.ar}</Text>
            <Text style={styles.banglaText}>{currentTasbih.bn}</Text>
            <Text style={styles.meaningText}>{currentTasbih.meaning}</Text>
            
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  headerButton: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#037764",
    shadowColor: "#037764",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#037764",
    textAlign: "center",
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontFamily: 'bangla_bold',
    fontSize: 16,
    color: '#037764',
  },
  counterArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
    fontSize: width * 0.2,
    color: "#037764",
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
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
  resetButton: {
    backgroundColor: "#e53e3e",
  },
  decrementButton: {
    backgroundColor: "#f6ad55",
  },
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