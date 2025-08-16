import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
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
import { Ionicons } from "@expo/vector-icons";

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
};

const initialHadithState = {
  date: formatDate(new Date()),
  read: {
    status: false,
    count: 0,
  },
};

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/hadith_data.json`;

async function ensureDataFileExists() {
  const fileInfo = await FileSystem.getInfoAsync(DATA_FILE_PATH);
  if (!fileInfo.exists) {
    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify([]));
  }
}

async function loadHadithData(date) {
  await ensureDataFileExists();
  try {
    const content = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    return JSON.parse(content).find((item) => item.date === date) || null;
  } catch (error) {
    console.error("Error loading data:", error);
    return null;
  }
}

async function saveHadithData(data) {
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
    console.error("Error saving data:", error);
  }
}

export default function HadithRead() {
  const router = useRouter();
  const [hadith, setHadith] = useState(initialHadithState);
  const [found, setFound] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempCount, setTempCount] = useState("0");

  useEffect(() => {
    loadData();
  }, [hadith.date]);

  const loadData = async () => {
    const data = await loadHadithData(hadith.date);
    if (data) {
      setHadith(data);
      setFound(true);
    } else {
      setFound(hadith.date === formatDate(new Date()));
      if (!found) setHadith({ ...initialHadithState, date: hadith.date });
    }
  };

  const handleDateChange = (date) => {
    setHadith((prev) => ({ ...prev, date: formatDate(date) }));
  };

  const handleCreateEntry = async () => {
    const newData = { ...initialHadithState, date: hadith.date };
    setHadith(newData);
    await saveHadithData(newData);
    setFound(true);
  };

  const toggleHadithRead = async () => {
    const newStatus = !hadith.read.status;
    const newData = {
      ...hadith,
      read: {
        status: newStatus,
        count: newStatus ? hadith.read.count || 1 : 0,
      },
    };
    setHadith(newData);
    await saveHadithData(newData);
  };

  const openCountModal = () => {
    setTempCount(hadith.read.count.toString());
    setModalVisible(true);
  };

  const saveCount = async () => {
    const countNum = parseInt(tempCount) || 0;
    const newData = {
      ...hadith,
      read: {
        status: countNum > 0,
        count: countNum,
      },
    };
    setHadith(newData);
    await saveHadithData(newData);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <PrayerCalendar
        selectedDate={new Date(hadith.date)}
        onDateChange={handleDateChange}
      />

      {!found ? (
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>
            {hadith.date} তারিখে কোন ডাটা নেই
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
              onPress={() => router.push("/pages/hadith")}
              style={{
                borderWidth: 1,
                borderColor: "#037764",
                paddingHorizontal: 10,
                borderRadius: 50,
              }}
            >
              <Text style={styles.sectionButtonTitle}>হাদিস পড়ুন</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.hadithContainer}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>আজ হাদিস পড়েছেন?</Text>
              <TouchableOpacity
                style={[
                  styles.switch,
                  hadith.read.status ? styles.active : styles.inactive,
                ]}
                onPress={toggleHadithRead}
              >
                <Ionicons
                  name={hadith.read.status ? "checkmark-circle" : "information-circle"}
                  size={20}
                  color={hadith.read.status ? "#037764" : "#e53e3e"}
                />
                <Text
                  style={
                    hadith.read.status ? styles.activeText : styles.inActiveText
                  }
                >
                  {hadith.read.status ? "হ্যাঁ করেছি" : "না করিনি"}
                </Text>
              </TouchableOpacity>
            </View>

            {hadith.read.status && (
              <TouchableOpacity
                style={styles.countContainer}
                onPress={openCountModal}
              >
                <Text style={styles.countText}>
                  পড়েছেন: {convertToBanglaNumbers(hadith.read.count)} টি হাদিস
                </Text>
                <Text style={styles.editText}>এডিট করুন</Text>
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
            <Text style={styles.modalTitle}>হাদিসের সংখ্যা</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={tempCount}
              onChangeText={setTempCount}
              placeholder="কয়টি হাদিস পড়েছেন?"
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
  hadithContainer: {
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
    backgroundColor: "#f0fdf4",
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
