import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import useSettingsStore from "../../../../store/settingsStore"; // Zustand থেকে ফন্ট সাইজ নিবেন

export default function DuaDetailsScreen() {
  const { catName, subCatName, currentIndex, duas } = useLocalSearchParams();
  const [currentDuaIndex, setCurrentDuaIndex] = useState(
    parseInt(currentIndex) || 0
  );
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [duasData, setDuasData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Zustand থেকে ফন্ট সাইজ ও আপডেট ফাংশন নেওয়া
  const { banglaFontSize, arabicFontSize, updateSetting } = useSettingsStore();

  // মডালের জন্য লোকাল ফন্ট সাইজ স্টেট
  const [localBanglaFontSize, setLocalBanglaFontSize] = useState(banglaFontSize);
  const [localArabicFontSize, setLocalArabicFontSize] = useState(arabicFontSize);

  useEffect(() => {
    try {
      if (duas) {
        const parsedDuas = JSON.parse(duas);
        setDuasData(Array.isArray(parsedDuas) ? parsedDuas : []);
      }
    } catch (error) {
      console.error("দোয়া ডেটা পার্স করতে ত্রুটি:", error);
      setDuasData([]);
    } finally {
      setLoading(false);
    }
  }, [duas]);

  // মডাল ওপেন হলে Zustand থেকে লোকাল স্টেট আপডেট
  useEffect(() => {
    if (settingsModalVisible) {
      setLocalBanglaFontSize(banglaFontSize);
      setLocalArabicFontSize(arabicFontSize);
    }
  }, [settingsModalVisible, banglaFontSize, arabicFontSize]);

  const enToBnNumber = (number) => {
    if (number === undefined || number === null) return "";
    const bnNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return number.toString().replace(/\d/g, (digit) => bnNumbers[digit]);
  };

  const renderDuaContent = (dua) => {
    if (!dua) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>দোয়ার তথ্য পাওয়া যায়নি</Text>
        </View>
      );
    }

    return (
      <View style={styles.duaContentContainer}>
        <View style={styles.duaHeader}>
          <View style={styles.avatar}>
            <Text style={[styles.avatarText]}>{enToBnNumber(dua.dua_id || "")}</Text>
          </View>
          <Text style={[styles.duaName]}>{dua.dua_name_bn || ""}</Text>
        </View>

        {dua.top_bn && (
          <>
            <View style={styles.spacer} />
            <Text style={[styles.text, { fontSize: localBanglaFontSize }]}>
              {dua.top_bn}
            </Text>
          </>
        )}

        {dua.dua_arabic && (
          <>
            <View style={styles.spacer} />
            <Text style={[styles.arabicText, { fontSize: localArabicFontSize }]}>
              {dua.dua_arabic}
            </Text>
          </>
        )}

        {dua.transliteration_bn && (
          <>
            <View style={styles.spacer} />
            <Text style={[styles.text, { fontSize: localBanglaFontSize }]}>
              {dua.transliteration_bn}
            </Text>
          </>
        )}

        {dua.translation_bn && (
          <>
            <View style={styles.spacer} />
            <Text style={[styles.text, { fontSize: localBanglaFontSize }]}>
              {dua.translation_bn}
            </Text>
          </>
        )}

        {dua.bottom_bn && (
          <>
            <View style={styles.spacer} />
            <Text style={[styles.text, { fontSize: localBanglaFontSize }]}>
              {dua.bottom_bn}
            </Text>
          </>
        )}

        {dua.reference_bn && (
          <>
            <View style={styles.spacer} />
            <Text style={[styles.referenceTitle]}>রেফারেন্সঃ</Text>
            <Text style={[styles.text, { fontSize: localBanglaFontSize }]}>
              {dua.reference_bn}
            </Text>
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00897B" />
        <Text style={styles.loadingText}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (duasData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>কোন দোয়া পাওয়া যায়নি</Text>
      </View>
    );
  }

  const currentDua = duasData[currentDuaIndex];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: catName,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setSettingsModalVisible(true)}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={20} color="#037764" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.subCategoryContainer}>
        <Text style={styles.subCategoryText}>
          পরিচ্ছেদঃ <Text style={styles.subCategoryName}>{subCatName}</Text>
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.scrollContainer}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {renderDuaContent(currentDua)}
        </ScrollView>
      </View>

      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => setCurrentDuaIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentDuaIndex === 0}
          style={[styles.navButton, currentDuaIndex === 0 && styles.disabledButton]}
        >
          <Text style={styles.navButtonText}>← পূর্বের</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          {enToBnNumber(currentDuaIndex + 1)} / {enToBnNumber(duasData.length)}
        </Text>

        <TouchableOpacity
          onPress={() => setCurrentDuaIndex((prev) => Math.min(duasData.length - 1, prev + 1))}
          disabled={currentDuaIndex === duasData.length - 1}
          style={[
            styles.navButton,
            currentDuaIndex === duasData.length - 1 && styles.disabledButton,
          ]}
        >
          <Text style={styles.navButtonText}>পরের →</Text>
        </TouchableOpacity>
      </View>

      {/* ফন্ট সেটিংস মডাল */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ফন্ট সেটিংস</Text>

            <Text style={styles.sliderLabel}>বাংলা ফন্ট সাইজ:</Text>
            <Slider
              style={styles.slider}
              minimumValue={14}
              maximumValue={20}
              value={localBanglaFontSize}
              onValueChange={(value) => setLocalBanglaFontSize(value)}
              onSlidingComplete={(value) => updateSetting("banglaFontSize", value)}
              minimumTrackTintColor="#00897B"
              maximumTrackTintColor="#000000"
            />
            <Text style={styles.sliderValue}>{enToBnNumber(Math.round(localBanglaFontSize))}</Text>

            <Text style={styles.sliderLabel}>আরবি ফন্ট সাইজ:</Text>
            <Slider
              style={styles.slider}
              minimumValue={16}
              maximumValue={40}
              value={localArabicFontSize}
              onValueChange={(value) => setLocalArabicFontSize(value)}
              onSlidingComplete={(value) => updateSetting("arabicFontSize", value)}
              minimumTrackTintColor="#00897B"
              maximumTrackTintColor="#000000"
            />
            <Text style={styles.sliderValue}>{enToBnNumber(Math.round(localArabicFontSize))}</Text>

            <TouchableOpacity
              onPress={() => setSettingsModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>বন্ধ করুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f2",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderValue: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "bangla_regular",
    marginTop: -10,
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "bangla_regular",
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    fontFamily: "bangla_regular",
  },
  settingsButton: {
    padding: 8,
  },
  subCategoryContainer: {
    backgroundColor: "white",
    padding: 12,
    margin: 10,
    borderWidth: 1,
    borderColor: "#cccccc91",
    borderRadius: 4,
  },
  subCategoryText: {
    fontSize: 16,
    color: "#00897B",
    fontFamily: "bangla_semibold",
  },
  subCategoryName: {
    color: "black",
    fontFamily: "bangla_regular",
  },
  spacer: {
    height: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  duaContentContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
  },
  duaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00897B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontFamily: "bangla_bold",
  },
  duaName: {
    flex: 1,
    fontSize: 16,
    fontFamily: "bangla_semibold",
  },
  text: {
    fontSize: 16,
    fontFamily: "bangla_regular",
    lineHeight: 24,
  },
  arabicText: {
    textAlign: "right",
    fontSize: 20,
    lineHeight: 32,
    fontFamily: "arabic",
  },
  referenceTitle: {
    fontSize: 16,
    fontFamily: "bangla_bold",
    marginBottom: 4,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navButton: {
    padding: 10,
    backgroundColor: "#00897B",
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  navButtonText: {
    color: "white",
    fontFamily: "bangla_medium",
  },
  pageInfo: {
    fontSize: 14,
    fontFamily: "bangla_semibold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: Dimensions.get("window").height * 0.4,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "bangla_bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "bangla_regular",
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#00897B",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontFamily: "bangla_medium",
  },
});
