import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import FridayAmolCalendar from "../../components/FridayAmolCalender";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

const amolNames = [
  { id: 1, name: "amol_1", label: "সূরা কাহফ তিলওয়াত", target: 1 },
  { id: 2, name: "amol_2", label: "দরুদে ইবরাহিম", target: 100 },
  { id: 3, name: "amol_3", label: "আস্তাগফিরুল্লা-হ", target: 1000 },
  {
    id: 4,
    name: "amol_4",
    label: "জুমার দিনের দরুদ (আসরের নামাযের পর)",
    target: 80,
  },
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

// Check if a date is Friday (day 5 in JavaScript, where 0=Sunday)
const isFriday = (dateString) => {
  const date = new Date(dateString);
  return date.getDay() === 5;
};

// Get the most recent Friday
const getLastFriday = () => {
  const date = new Date();
  while (date.getDay() !== 5) {
    date.setDate(date.getDate() - 1);
  }
  return formatDate(date);
};

const initialAmolState = {
  date: getLastFriday(),
  count: {
    amol_1: 0,
    amol_2: 0,
    amol_3: 0,
    amol_4: 0,
  },
};

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/friday_data.json`;

async function ensureDataFileExists() {
  const fileInfo = await FileSystem.getInfoAsync(DATA_FILE_PATH);
  if (!fileInfo.exists) {
    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify([]));
  }
}

async function loadAmolData(date) {
  await ensureDataFileExists();
  try {
    const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const data = JSON.parse(fileContent);
    return data.find((item) => item.date === date) || null;
  } catch (error) {
    console.error("Error loading amol data:", error);
    return null;
  }
}

async function saveAmolData(newData) {
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
    console.error("Error saving amol data:", error);
  }
}

export default function FridayAmol() {
  const router = useRouter();
  const [amol, setAmol] = useState(initialAmolState);
  const [found, setFound] = useState(true);
  const [isSelectedDateFriday, setIsSelectedDateFriday] = useState(
    isFriday(initialAmolState.date)
  );

  // Manual edit states
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAmol, setCurrentAmol] = useState(null);
  const [manualCount, setManualCount] = useState("");

  useEffect(() => {
    const loadDataForCurrentDate = async () => {
      const data = await loadAmolData(amol.date);
      setIsSelectedDateFriday(isFriday(amol.date));

      if (data) {
        setAmol(data);
        setFound(true);
      } else {
        if (amol.date === getTodayDate() && isFriday(amol.date)) {
          setFound(false);
          setAmol((prev) => ({ ...initialAmolState, date: prev.date }));
        } else {
          setFound(true);
          setAmol((prev) => ({ ...initialAmolState, date: prev.date }));
        }
      }
    };
    loadDataForCurrentDate();
  }, [amol.date]);

  const handleDateChange = async (date) => {
    const formattedDate = formatDate(date);
    if (isFriday(formattedDate) && new Date(formattedDate) <= new Date()) {
      setAmol((prev) => ({ ...prev, date: formattedDate }));
    }
  };

  const handleCreateNewEntry = async () => {
    if (amol.date === getTodayDate() && isFriday(amol.date)) {
      const newEntry = {
        ...initialAmolState,
        date: amol.date,
      };
      setAmol(newEntry);
      await saveAmolData(newEntry);
      setFound(true);
    }
  };

  const navigateToCountScreen = (amolType) => {
    if (found || (amol.date === getTodayDate() && isFriday(amol.date))) {
      router.push({
        pathname: "/pages/friday-amol-count",
        params: {
          amolType,
          date: amol.date,
          currentCount: amol.count[amolType] || 0,
        },
      });
    }
  };

  const handleLongPress = (amolType) => {
    setCurrentAmol(amolType);
    setManualCount(amol.count[amolType]?.toString() || "0");
    setModalVisible(true);
  };

  const handleSaveManualCount = async () => {
    const count = parseInt(manualCount);
    if (isNaN(count) || count < 0) {
      Alert.alert("ভুল ইনপুট", "দয়া করে একটি বৈধ সংখ্যা লিখুন");
      return;
    }

    const updatedAmol = {
      ...amol,
      count: {
        ...amol.count,
        [currentAmol]: count,
      },
    };

    setAmol(updatedAmol);
    await saveAmolData(updatedAmol);
    setModalVisible(false);
  };

  return (
    <ScrollView style={{ backgroundColor: "#ffffff" }}>
      <View style={styles.container}>
        <FridayAmolCalendar
          selectedDate={new Date(amol.date)}
          onDateChange={handleDateChange}
        />

        {!isSelectedDateFriday ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>
              শুধুমাত্র শুক্রবারের তারিখে আমল ট্র্যাক করা যাবে
            </Text>
          </View>
        ) : !found && amol.date === getTodayDate() && isFriday(amol.date) ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>
              আজকের তারিখে কোন ডাটা পাওয়া যায়নি
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
        ) : found ? (
          <>
            <Text style={styles.sectionTitle}>জুমার আমল ট্র্যাকার</Text>

            {amolNames.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.amolItem}
                onPress={() => navigateToCountScreen(item.name)}
                onLongPress={() => handleLongPress(item.name)}
                delayLongPress={500}
              >
                <Text style={styles.amolLabel}>{item.label}</Text>
                <View style={styles.countContainer}>
                  <Text style={styles.countText}>
                    {convertToBanglaNumbers(amol.count[item.name] || 0)}/
                    {convertToBanglaNumbers(item.target)}
                  </Text>
                  <Text style={styles.countPercentage}>
                    {convertToBanglaNumbers(
                      Math.round(
                        ((amol.count[item.name] || 0) / item.target) * 100
                      )
                    )}
                    %
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>
              এই তারিখে ডাটা এডিট করার অনুমতি নেই। শুধুমাত্র আজকের তারিখে
              (শুক্রবার) নতুন ডাটা যোগ করা যাবে।
            </Text>
          </View>
        )}

        {/* Manual Count Modal */}
        <Modal
          animationType="slide"
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
  container: { flex: 1, padding: 10 },
  sectionTitle: {
    fontFamily: "bangla_medium",
    marginHorizontal: 5,
    borderBottomColor: "#e2e8f0",
    paddingLeft: 5,
    borderBottomWidth: 1,
    marginTop: 5,
    marginBottom: 15,
  },
  amolItem: {
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
  amolLabel: { fontFamily: "bangla_medium", color: "#037764" },
  countContainer: { alignItems: "flex-end" },
  countText: { fontFamily: "bangla_bold", fontSize: 12 },
  countPercentage: {
    fontFamily: "bangla_bold",
    fontSize: 12,
    color: "#037764",
    marginTop: 3,
  },
  notFoundContainer: { marginTop: 20, alignItems: "center", padding: 20 },
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
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#e53e3e" },
  saveButton: { backgroundColor: "#037764" },
  buttonText: { color: "white", fontFamily: "bangla_medium" },
});
