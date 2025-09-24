import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PrayerCalendar from "../../components/prayer/PrayerCalendar";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
};

const initialQuranState = {
  date: formatDate(new Date()),
  read: {
    status: false,
    count: 0,
  },
};

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/quran_data.json`;

async function ensureDataFileExists() {
  const fileInfo = await FileSystem.getInfoAsync(DATA_FILE_PATH);
  if (!fileInfo.exists) {
    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify([]));
  }
}

async function loadQuranData(date) {
  await ensureDataFileExists();
  try {
    const content = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    return JSON.parse(content).find((item) => item.date === date) || null;
  } catch (error) {
    console.error("Error loading Quran data:", error);
    return null;
  }
}

async function saveQuranData(data) {
  await ensureDataFileExists();
  try {
    const content = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const allData = JSON.parse(content);
    const index = allData.findIndex((item) => item.date === data.date);

    if (index >= 0) allData[index] = data;
    else allData.push(data);

    await FileSystem.writeAsStringAsync(
      DATA_FILE_PATH,
      JSON.stringify(allData)
    );
  } catch (error) {
    console.error("Error saving Quran data:", error);
  }
}

export default function QuranRead() {
  const router = useRouter();
  const [quran, setQuran] = useState(initialQuranState);
  const [found, setFound] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempCount, setTempCount] = useState("0");

  useEffect(() => {
    loadData();
  }, [quran.date]);

  const loadData = async () => {
    const data = await loadQuranData(quran.date);
    if (data) {
      setQuran(data);
      setFound(true);
    } else {
      setFound(quran.date === formatDate(new Date()));
      if (!found) setQuran({ ...initialQuranState, date: quran.date });
    }
  };

  const handleDateChange = (date) => {
    setQuran((prev) => ({ ...prev, date: formatDate(date) }));
  };

  const handleCreateEntry = async () => {
    const newData = { ...initialQuranState, date: quran.date };
    setQuran(newData);
    await saveQuranData(newData);
    setFound(true);
  };

  const toggleQuranRead = async () => {
    const newStatus = !quran.read.status;
    const newData = {
      ...quran,
      read: {
        status: newStatus,
        count: newStatus ? quran.read.count || 1 : 0,
      },
    };
    setQuran(newData);
    await saveQuranData(newData);
  };

  const openCountModal = () => {
    setTempCount(quran.read.count.toString());
    setModalVisible(true);
  };

  const saveCount = async () => {
    const countNum = parseInt(tempCount) || 0;
    const newData = {
      ...quran,
      read: {
        status: countNum > 0,
        count: countNum,
      },
    };
    setQuran(newData);
    await saveQuranData(newData);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <PrayerCalendar
        selectedDate={new Date(quran.date)}
        onDateChange={handleDateChange}
      />

      {!found ? (
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>
            {quran.date} তারিখে কোন ডাটা নেই
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateEntry}
          >
            <Text style={styles.createButtonText}>নতুন এন্ট্রি তৈরি করুন</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 8,
              borderBottomColor: "#e2e8f0",
              paddingHorizontal: 5,
              borderBottomWidth: 1,
              marginVertical: 5,
              paddingBottom: 5,
            }}
          >
            <Text style={styles.sectionTitle}>হাদিস পড়া ট্র্যাকার</Text>
            <TouchableOpacity
              onPress={() => router.push("/pages/education/quran")}
              style={{
                borderWidth: 1,
                borderColor: "#037764",
                paddingHorizontal: 10,
                borderRadius: 50,
              }}
            >
              <Text style={styles.sectionButtonTitle}>কুরআন পড়ুন</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quranContainer}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>আজ কুরআন তিলাওয়াত করেছেন?</Text>
              <TouchableOpacity
                style={[
                  styles.switch,
                  quran.read.status ? styles.active : styles.inactive,
                ]}
                onPress={toggleQuranRead}
              >
                <Ionicons
                  name={
                    quran.read.status
                      ? "checkmark-circle"
                      : "information-circle"
                  }
                  size={20}
                  color={quran.read.status ? "#037764" : "#e53e3e"}
                />
                <Text
                  style={
                    quran.read.status ? styles.activeText : styles.inActiveText
                  }
                >
                  {quran.read.status ? "হ্যাঁ করেছি" : "না করিনি"}
                </Text>
              </TouchableOpacity>
            </View>

            {quran.read.status && (
              <TouchableOpacity
                style={styles.countContainer}
                onPress={openCountModal}
              >
                <Text style={styles.countText}>
                  তিলাওয়াত করেছেন: {convertToBanglaNumbers(quran.read.count)}{" "}
                  আয়াত
                </Text>
                <Text style={styles.editText}>পরিমাণ এডিট করুন</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* Count Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>আয়াত সংখ্যা</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={tempCount}
              onChangeText={setTempCount}
              placeholder="কয়টি আয়াত পড়েছেন?"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveCount}
              >
                <Text style={styles.saveButtonText}>সংরক্ষণ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontFamily: "bangla_medium",
  },
  sectionButtonTitle: {
    fontFamily: "bangla_medium",
    color: "#037764",
  },
  quranContainer: {
    margin: 10,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontFamily: "bangla_medium",
    flex: 1,
    color: "#2d3748",
  },
  switch: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  active: {
    backgroundColor: "#ebf8ff",
    borderColor: "#037764",
  },
  inactive: {
    backgroundColor: "#fff5f5",
    borderColor: "#e53e3e",
  },
  activeText: {
    fontFamily: "bangla_medium",
    fontSize: 12,
    marginLeft: 5,
    color: "#037764",
  },
  inActiveText: {
    fontFamily: "bangla_medium",
    fontSize: 12,
    marginLeft: 5,
    color: "#e53e3e",
  },
  countContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  countText: {
    fontFamily: "bangla_bold",
    color: "#037764",
  },
  editText: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#4a5568",
    marginTop: 5,
    textAlign: "right",
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
    padding: 10,
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
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
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
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontFamily: "bangla_regular",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  saveButton: {
    backgroundColor: "#037764",
  },
  buttonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
  },
  saveButtonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#ffffff",
  },
});
