import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

const { width } = Dimensions.get('window');

const istighfars = [
  {
    id: 1,
    name: "sayyidul_istighfar",
    ar: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    bn: "আল্লাহুম্মা আনতা রাব্বি লা ইলাহা ইল্লা আংতা খালাক্কতানি ওয়া আনা আবদুকা ওয়া আনা আলা আহদিকা ওয়া ওয়াদিকা মাসতাতাতু আউজুবিকা মিন শাররি মা সানাতু আবুউলাকা বিনিমাতিকা আলাইয়্যা ওয়া আবুউলাকা বিজাম্বি ফাগফিরলি ফা-ইন্নাহু লা ইয়াগফিরুজ জুনুবা ইল্লা আংতা।",
    meaning: "হে আল্লাহ, তুমি আমার প্রতিপালক। তুমি ছাড়া আর কোনো ইলাহ নেই। তুমিই আমাকে সৃষ্টি করেছ। আমি তোমার বান্দা। আমি যথাসাধ্য তোমার সঙ্গে কৃত অঙ্গীকার ও প্রতিশ্রুতির উপর রয়েছি। আমি আমার কৃতকর্মের অনিষ্ট থেকে তোমার আশ্রয় প্রার্থনা করছি। আমার প্রতি তোমার দেওয়া নেয়ামত স্বীকার করছি এবং আমার পাপও স্বীকার করছি। অতএব, তুমি আমাকে ক্ষমা করে দাও। নিশ্চয়ই তুমি ছাড়া আর কেউ গুনাহ ক্ষমা করতে পারে না।",
  },
  {
    id: 2,
    name: "astaghfirullah",
    ar: "أَسْتَغْفِرُالله",
    bn: "আস্তাগফিরুল্লা-হ",
    meaning: "আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি।",
  },
];

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/istighfar_data.json`;

async function updateIstighfarCount(date, istighfarType, newCount) {
  try {
    const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const data = JSON.parse(fileContent);

    const existingIndex = data.findIndex((item) => item.date === date);
    if (existingIndex >= 0) {
      data[existingIndex].count[istighfarType] = newCount;
    } else {
      const newEntry = {
        date,
        count: {
          [istighfarType]: newCount,
        },
      };
      data.push(newEntry);
    }

    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify(data));
  } catch (error) {
    console.error("Error updating istighfar count:", error);
  }
}

export default function IstighfarCount() {
  const params = useLocalSearchParams();
  const { istighfarType, date, currentCount } = params;
  const [count, setCount] = useState(Number(currentCount) || 0);
  const [modalVisible, setModalVisible] = useState(false);
  const currentIstighfar = istighfars.find((item) => item.name === istighfarType);

  const handleIncrement = async () => {
    const newCount = count + 1;
    setCount(newCount);
    await updateIstighfarCount(date, istighfarType, newCount);
  };

  const handleDecrement = async () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      await updateIstighfarCount(date, istighfarType, newCount);
    }
  };

  const handleReset = async () => {
    setCount(0);
    await updateIstighfarCount(date, istighfarType, 0);
  };

  return (
    <View style={styles.container}>
      {/* Header with Istighfar name */}
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text numberOfLines={1} style={styles.headerText}>
          {currentIstighfar.bn}
        </Text>
      </TouchableOpacity>

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
            <Text style={styles.arabicText}>{currentIstighfar.ar}</Text>
            <Text style={styles.banglaText}>{currentIstighfar.bn}</Text>
            <Text style={styles.meaningText}>{currentIstighfar.meaning}</Text>
            
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
    marginBottom: 20,
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
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#037764",
    textAlign: "center",
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