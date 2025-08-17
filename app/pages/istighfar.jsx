import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import PrayerCalendar from "../../components/prayer/PrayerCalendar";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

const istighfarNames = [
  {
    id: 1,
    name: "sayyidul_istighfar",
    label: "সাইয়্যিদুল ইস্তেগফার",
    target: 2,
  },
  { id: 2, name: "astaghfirullah", label: "আস্তাগফিরুল্লা-হ", target: 100 },
];

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDate = () => {
  return formatDate(new Date());
};

const initialIstighfarState = {
  date: getTodayDate(),
  count: {
    sayyidul_istighfar: 0,
    astaghfirullah: 0,
  },
};

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/istighfar_data.json`;

async function ensureDataFileExists() {
  const fileInfo = await FileSystem.getInfoAsync(DATA_FILE_PATH);
  if (!fileInfo.exists) {
    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify([]));
  }
}

async function loadIstighfarData(date) {
  await ensureDataFileExists();
  try {
    const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const data = JSON.parse(fileContent);
    return data.find((item) => item.date === date) || null;
  } catch (error) {
    console.error("Error loading istighfar data:", error);
    return null;
  }
}

async function saveIstighfarData(newData) {
  await ensureDataFileExists();
  try {
    const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const data = JSON.parse(fileContent);

    const existingIndex = data.findIndex((item) => item.date === newData.date);
    if (existingIndex >= 0) {
      data[existingIndex] = newData;
    } else {
      data.push(newData);
    }

    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving istighfar data:", error);
  }
}

export default function Istighfar() {
  const router = useRouter();
  const [istighfar, setIstighfar] = useState(initialIstighfarState);
  const [found, setFound] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIstighfar, setCurrentIstighfar] = useState(null);
  const [manualCount, setManualCount] = useState("");

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadDataForCurrentDate = async () => {
        try {
          const data = await loadIstighfarData(istighfar.date);

          if (!isMounted) return;

          if (data) {
            setIstighfar(data);
            setFound(true);
          } else {
            if (istighfar.date === getTodayDate()) {
              setFound(true);
            } else {
              setFound(false);
              setIstighfar((prev) => ({
                ...initialIstighfarState,
                date: prev.date,
              }));
            }
          }
        } catch (error) {
          console.error("Error loading Istighfar data:", error);
          if (isMounted) {
            setFound(false);
          }
        }
      };

      loadDataForCurrentDate();

      return () => {
        isMounted = false;
      };
    }, [istighfar.date])
  );

  const handleDateChange = async (date) => {
    const formattedDate = formatDate(date);
    setIstighfar((prev) => ({ ...prev, date: formattedDate }));
  };

  const handleCreateNewEntry = async () => {
    const newEntry = {
      ...initialIstighfarState,
      date: istighfar.date,
    };
    setIstighfar(newEntry);
    await saveIstighfarData(newEntry);
    setFound(true);
  };

  const navigateToCountScreen = (istighfarType) => {
    router.push({
      pathname: "/pages/istighfar-count",
      params: {
        istighfarType,
        date: istighfar.date,
        currentCount: istighfar.count[istighfarType] || 0,
      },
    });
  };

  const handleLongPress = (istighfarType) => {
    setCurrentIstighfar(istighfarType);
    setManualCount(istighfar.count[istighfarType]?.toString() || "0");
    setModalVisible(true);
  };

  const handleSaveManualCount = async () => {
    const count = parseInt(manualCount);
    if (isNaN(count) || count < 0) {
      Alert.alert("ভুল ইনপুট", "দয়া করে একটি বৈধ সংখ্যা লিখুন");
      return;
    }

    const updatedIstighfar = {
      ...istighfar,
      count: {
        ...istighfar.count,
        [currentIstighfar]: count,
      },
    };

    setIstighfar(updatedIstighfar);
    await saveIstighfarData(updatedIstighfar);
    setModalVisible(false);
  };

  return (
    <ScrollView style={{ backgroundColor: "#ffffff" }}>
      <View style={styles.container}>
        <PrayerCalendar
          selectedDate={new Date(istighfar.date)}
          onDateChange={handleDateChange}
        />

        {!found ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>
              {istighfar.date} তারিখে কোন ডাটা পাওয়া যায়নি
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateNewEntry}
            >
              <Text style={styles.createButtonText}>
                নতুন এন্ট্রি তৈরি করুন
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>ইস্তেগফার ট্র্যাকার</Text>

            {istighfarNames.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.istighfarItem}
                onPress={() => navigateToCountScreen(item.name)}
                onLongPress={() => handleLongPress(item.name)}
                delayLongPress={500}
              >
                <Text style={styles.istighfarLabel}>{item.label}</Text>
                <View style={styles.countContainer}>
                  <Text style={styles.countText}>
                    {convertToBanglaNumbers(istighfar.count[item.name] || 0)}/
                    {convertToBanglaNumbers(item.target)}
                  </Text>
                  <Text style={styles.countPercentage}>
                    {convertToBanglaNumbers(
                      Math.round(
                        ((istighfar.count[item.name] || 0) / item.target) * 100
                      )
                    )}
                    %
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Manual Count Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>ম্যানুয়াল কাউন্ট এডিট করুন</Text>

              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={manualCount}
                onChangeText={setManualCount}
                placeholder="কাউন্ট সংখ্যা লিখুন"
                placeholderTextColor="#999"
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>বাতিল</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveManualCount}
                >
                  <Text style={styles.buttonText}>সেভ করুন</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontFamily: "bangla_medium",
    marginHorizontal: 5,
    borderBottomColor: "#e2e8f0",
    paddingLeft: 5,
    borderBottomWidth: 1,
    marginTop: 5,
    marginBottom: 15,
  },
  istighfarItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  istighfarLabel: {
    fontFamily: "bangla_medium",
    color: "#037764",
  },
  countContainer: {
    alignItems: "flex-end",
  },
  countText: {
    fontFamily: "bangla_bold",
    fontSize: 12,
  },
  countPercentage: {
    fontFamily: "bangla_bold",
    fontSize: 12,
    color: "#037764",
    marginTop: 3,
  },
  notFoundContainer: {
    marginTop: 20,
    alignItems: "center",
    padding: 20,
  },
  notFoundText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#e53e3e",
    marginBottom: 20,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#037764",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  createButtonText: {
    fontFamily: "bangla_medium",
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontFamily: "bangla_bold",
    fontSize: 18,
    color: "#037764",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontFamily: "bangla_medium",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e53e3e",
  },
  saveButton: {
    backgroundColor: "#037764",
  },
  buttonText: {
    color: "white",
    fontFamily: "bangla_medium",
  },
});