import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as FileSystem from "expo-file-system";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import convertToBanglaNumbers from "../../../utils/convertToBanglaNumber";

export default function Hadiths() {
  const params = useLocalSearchParams();
  const { book_id, chapter_id, chapter_name, book_name, colorCode } = params;
  const BOOK_DIR =
    FileSystem.documentDirectory + `app_dir/hadith/book_${book_id}`;
  const HADITH_FILE = `${BOOK_DIR}/book_${book_id}_chapter_${chapter_id}_sections.json`;

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [arabicFontSize, setArabicFontSize] = useState(20);
  const [banglaFontSize, setBanglaFontSize] = useState(16);

  useEffect(() => {
    const loadHadiths = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(HADITH_FILE);
        if (!fileInfo.exists) {
          throw new Error("হাদিসের ফাইল পাওয়া যায়নি");
        }

        const fileContent = await FileSystem.readAsStringAsync(HADITH_FILE);
        const jsonData = JSON.parse(fileContent);

        // Validate and add missing IDs
        const validatedData = jsonData.map((item, index) => ({
          ...item,
          id: item.id || index,
          hadiths:
            item.hadiths?.map((hadith, hIndex) => ({
              ...hadith,
              id: hadith.id || `${index}-${hIndex}`,
              hadith_id: hadith.hadith_id || hIndex + 1,
            })) || [],
        }));

        setSections(validatedData);
        setLoading(false);
      } catch (err) {
        console.error("হাদিস লোড করতে সমস্যা:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadHadiths();
  }, [book_id, chapter_id]);

  const renderSection = ({ item }) => (
    <View style={styles.sectionContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>{item.number}</Text>
        {item.number !== item.title && (
          <Text style={styles.sectionTitle}>{item.title}</Text>
        )}
        {item.preface && <Text style={styles.prefaceText}>{item.preface}</Text>}
      </View>

      <FlatList
        data={item.hadiths.filter(
          (hadith) =>
            hadith.hadith_id !== null && hadith.bn && hadith.bn.length > 0
        )}
        renderItem={({ item: hadith }) => (
          <View style={styles.hadithContainer}>
            <View style={styles.hadithHeader}>
              <Text style={styles.hadithNumber}>
                {convertToBanglaNumbers(hadith.hadith_id)}
              </Text>
              {hadith.grade && (
                <Text
                  style={[
                    styles.gradeText,
                    { backgroundColor: hadith.grade_color },
                  ]}
                >
                  {hadith.grade}
                </Text>
              )}
            </View>
            <Text style={[styles.hadithArText, { fontSize: arabicFontSize }]}>
              {hadith.ar}
            </Text>
            {hadith.narrator && (
              <Text style={styles.narratorText}>
                {hadith.narrator} হতে বর্ণিত,
              </Text>
            )}
            <Text style={[styles.hadithText, { fontSize: banglaFontSize }]}>
              {hadith.bn}
            </Text>
          </View>
        )}
        keyExtractor={(hadith, index) =>
          hadith?.id?.toString() || index.toString()
        }
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colorCode} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `${book_name}-${chapter_name}`,
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#333",
          headerTitleStyle: { fontFamily: "bangla_bold" },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ marginRight: 4}}
            >
              <Ionicons name="options" size={24} color="#037764" />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
      />

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>ফন্ট সাইজ সেটিংস</Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                আরবি ফন্ট সাইজ: {arabicFontSize}
              </Text>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={14}
                maximumValue={30}
                step={1}
                value={arabicFontSize}
                onValueChange={(value) => setArabicFontSize(value)}
                minimumTrackTintColor="#037764"
                maximumTrackTintColor="#d3d3d3"
              />
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                বাংলা ফন্ট সাইজ: {banglaFontSize}
              </Text>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={12}
                maximumValue={24}
                step={1}
                value={banglaFontSize}
                onValueChange={(value) => setBanglaFontSize(value)}
                minimumTrackTintColor="#037764"
                maximumTrackTintColor="#d3d3d3"
              />
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.closeButtonText}>ঠিক আছে</Text>
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
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    padding: 10,
  },
  section: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 0.3,
  },
  sectionTitle: {
    fontFamily: "bangla_bold",
    color: "#333",
    marginBottom: 8,
  },
  prefaceText: {
    fontFamily: "bangla_regular",
    color: "#555",
  },
  sectionNumber: {
    fontSize: 14,
    fontFamily: "bangla_bold",
    color: "#037764",
  },
  hadithContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 0.3,
  },
  hadithHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  hadithNumber: {
    fontFamily: "bangla_bold",
    fontSize: 16,
    color: "#037764",
  },
  gradeText: {
    fontFamily: "bangla_medium",
    fontSize: 12,
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hadithArText: {
    fontFamily: "arabic",
    lineHeight: 36,
    color: "#333",
    textAlign: "justify",
    marginBottom: 10,
  },
  hadithText: {
    fontFamily: "bangla_regular",
    lineHeight: 24,
    color: "#333",
    textAlign: "justify",
  },
  narratorText: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    color: "#037764",
    marginTop: 8,
  },
  errorText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "bangla_bold",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#037764",
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontFamily: "bangla_medium",
    fontSize: 14,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: "#037764",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
    fontFamily: "bangla_medium",
    fontSize: 16,
  },
});