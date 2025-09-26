import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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

const amols = [
  {
    id: 1,
    name: "amol_1",
    ar: "",
    bn: "সুরা কাহফ",
    meaning:
      "- 'যে ব্যক্তি সূরা কাহফ পাঠ করবে, কিয়ামতের দিন তার জন্য এমন একটি নূর হবে, যা তার অবস্থানের জায়গা থেকে মক্কা পর্যন্ত আলোকিত করে দিবে। আর যে ব্যক্তি উহার শেষ দশটি আয়াত পাঠ করবে, তার জীবদ্দশায় দাজ্জাল বের হলেও সে তার কোনো ক্ষতি করতে পারবে না।' (সিলসিলায়ে সহীহা -২৬৫১)।\n- যে ব্যক্তি জুমার রাত্রিতে সূরা কাহফ পাঠ করবে, তার জন্য স্বীয় অবস্থানের জায়গা হতে পবিত্র মক্কা পর্যন্ত একটি নূর হবে।' (সহীহ তারগীব ওয়াত্ তারহীব - ৭৩৬)।\n- জুমার দিনে সূরা কাহফ পাঠ করিলে কিয়ামত দিবসে তার পায়ের নীচ থেকে আকাশের মেঘমালা পর্যন্ত নূর আলোকিত হবে এবং দুই জুমার মধ্যবর্তী গুনাহ মাফ হবে। (আত তারগীব ওয়াল তারহীব- ১/২৯৮)",
  },
  {
    id: 2,
    name: "amol_2",
    ar: "اَللّهُمَّ صَلِّ عَلى مُحَمَّدٍ وَّعَلى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلى إِبْرَاهِيْمَ وَعَلى آلِ إِبْرَاهِيْمَ إِنَّكَ حَمِيْدٌ مَجِيْدُ، اَللّهُمَّ بَارِكْ عَلى مُحَمَّدٍ وَّعَلى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلى إِبْرَاهِيْمَ وَعَلى آلِ إِبْرَاهِيْمَ إِنَّكَ حَمِيْدٌ مَّجِيْدٌ",
    bn: "আল্লাহুম্মা সাল্লি আ’লা মুহাম্মাদিওঁ ওয়া আ’লা আলি মুহাম্মাদিন কামা সাল্লাইতা আ’লা ইব্রাহীমা ওয়া আ’লা আলি ইব্রাহীমা ইন্নাকা হামিদুম্ মাজিদ, আল্লাহুম্মা বারিক আ’লা মুহাম্মাদিওঁ ওয়া আ’লা আলি মুহাম্মাদিন কামা বারাক্‌তা আ’লা ইব্রাহীমা ওয়া আলা আলি ইব্রাহিমা ইন্নাকা হামিদুম্ মাজিদ।",
    meaning:
      "হে আল্লাহ, হযরত মুহাম্মদ (সাঃ) এবং তাঁর বংশধরের উপর শান্তি ও রহমত বর্ষণ করুন, যেমনটি করেছিলেন হযরত ইব্রাহীম (আঃ) এবং তাঁর বংশধরের উপর। নিশ্চয়ই আপনি প্রশংসিত, সম্মানিত। হে আল্লাহ, হযরত মুহাম্মদ (সাঃ) এবং তাঁর বংশধরের উপর বরকত বর্ষণ করুন, যেমনটি করেছিলেন হযরত ইব্রাহীম (আঃ) এবং তাঁর বংশধরের উপর। নিশ্চয়ই আপনি প্রশংসিত, সম্মানিত।",
  },
  {
    id: 3,
    name: "amol_3",
    ar: "أَسْتَغْفِرُالله",
    bn: "আস্তাগফিরুল্লা-হ",
    meaning: "আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি।",
  },
  {
    id: 4,
    name: "amol_4",
    ar: "اللَّهمَّ صلِّ علَى محمَّدٍ النَّبيِّ الأُمِّيِّ وعلى آله وسلم تسليمًا",
    bn: "আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিনিন নাবিয়্যিল উম্মিয়্যি ওয়া আলা আলিহি ওয়াসাল্লিম তাসলিমা",
    meaning:
      "হে আল্লাহ, উম্মি নবীর (স.) উপর এবং তাঁর পরিবার-পরিজনের উপর শান্তি ও রহমত বর্ষণ করুন।\nযে ব্যক্তি জুমার দিন ৮০ বার দরুদ পড়ে তার ৮০ বছরের গুনাহ মাফ করে দেয়া হয়।' অন্য রেওয়াতে নবী করিম সা. বলেন, 'যে ব্যক্তি জুমার দিন আসরের নামাজের পর নিজ স্থান থেকে ওঠার আগে ৮০ বার এই দরুদ শরিফ পাঠ করে।",
  },
];

const QURAN_DIR = `${FileSystem.documentDirectory}app_dir/quran`;
const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/friday_data.json`;

// ✅ update amol count in JSON
async function updateAmolCount(date, amolType, newCount) {
  try {
    const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const data = JSON.parse(fileContent);

    const existingIndex = data.findIndex((item) => item.date === date);
    if (existingIndex >= 0) {
      data[existingIndex].count[amolType] = newCount;
    } else {
      const newEntry = {
        date,
        count: {
          [amolType]: newCount,
        },
      };
      data.push(newEntry);
    }

    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify(data));
  } catch (error) {
    console.error("Error updating amol count:", error);
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

export default function AmolCount() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { amolType, date, currentCount } = params;
  const [count, setCount] = useState(Number(currentCount) || 0);
  const [modalVisible, setModalVisible] = useState(false);
  const currentAmol = amols.find((item) => item.name === amolType);
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
    await updateAmolCount(date, amolType, newCount);

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
      await updateAmolCount(date, amolType, newCount);
    }
  };

  const handleReset = async () => {
    setCount(0);
    await updateAmolCount(date, amolType, 0);
  };

  const navigateToSurahKahf = async () => {
    const AYAH_DIR = `${QURAN_DIR}/ayah/surah_17.json`;
    const fileInfo = await FileSystem.getInfoAsync(AYAH_DIR);
    if (!fileInfo.exists) {
      router.push("/pages/quran");
      return;
    }
    router.push({
      pathname: `/pages/quran/surah`,
      params: {
        surahData: JSON.stringify({
          serial: 18,
          total_ayah: 110,
          name: "الكهف",
          name_en: "Al-Kahf",
          meaning: "The Cave",
          type: "Meccan",
          name_bn: "আল-কাহফ",
          meaning_bn: "গুহা",
        }),
      },
    });
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
      
      {/* Header with Amol name */}
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text numberOfLines={1} style={styles.headerText}>
          {currentAmol.bn}
        </Text>
      </TouchableOpacity>

      {/* Surah Kahf button - same style as header */}
      {amolType === "amol_1" && (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={navigateToSurahKahf}
        >
          <Text style={styles.headerText}>সূরা কাহফ পড়ুন</Text>
        </TouchableOpacity>
      )}

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
            {currentAmol.ar ? (
              <Text style={styles.arabicText}>{currentAmol.ar}</Text>
            ) : null}
            <Text style={styles.banglaText}>{currentAmol.bn}</Text>
            <Text style={styles.meaningText}>{currentAmol.meaning}</Text>

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
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
  counterArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
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
    padding: 12,
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