import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PrayerCalendar from "../../components/prayer/PrayerCalendar";
import PrayerDetailItem from "../../components/prayer/PrayerDetailItem";
import PrayerSwitch from "../../components/prayer/PrayerSwitch";
import RakaatModal from "../../components/prayer/RakaatModal";
import TahajjudPrayerSwitch from "../../components/prayer/TahajjudPrayerSwitch";
import NafilPrayerSwitch from "../../components/prayer/NafilPrayerSwitch";

const prayerNames = [
  { name: "fajr", label: "ফজর", defaultRakaat: 2 },
  { name: "dhuhr", label: "যোহর", defaultRakaat: 4 },
  { name: "asr", label: "আসর", defaultRakaat: 4 },
  { name: "maghrib", label: "মাগরিব", defaultRakaat: 3 },
  { name: "isha", label: "ইশা", defaultRakaat: 4 },
  { name: "tahajjud", label: "তাহাজ্জুদ", defaultRakaat: 2 },
  { name: "nafil", label: "নফল", defaultRakaat: 2 },
];

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return formatDate(new Date());
};

const initialPrayerState = {
  date: getTodayDate(),
  salat: {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    tahajjud: false,
    nafil: false,
  },
  rakaat: {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    tahajjud: 0,
    nafil: 0,
  },
  jamaat: {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  },
};

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/salah_data.json`;

async function ensureDataFileExists() {
  const fileInfo = await FileSystem.getInfoAsync(DATA_FILE_PATH);
  if (!fileInfo.exists) {
    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify([]));
  }
}

async function loadPrayerData(date) {
  await ensureDataFileExists();
  try {
    const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const data = JSON.parse(fileContent);
    return data.find((item) => item.date === date) || null;
  } catch (error) {
    console.error("Error loading prayer data:", error);
    return null;
  }
}

async function savePrayerData(newData) {
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
    console.error("Error saving prayer data:", error);
  }
}

export default function Prayer() {
  const [prayer, setPrayer] = useState(initialPrayerState);
  const [found, setFound] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPrayer, setCurrentPrayer] = useState("");
  const [tempRakaat, setTempRakaat] = useState("");

  useFocusEffect(
    useCallback(() => {
      const loadDataForCurrentDate = async () => {
        const data = await loadPrayerData(prayer.date);
        if (data) {
          setPrayer(data);
          setFound(true);
        } else {
          if (prayer.date === getTodayDate()) {
            setFound(true);
          } else {
            setFound(false);
            setPrayer((prev) => ({ ...initialPrayerState, date: prev.date }));
          }
        }
      };

      loadDataForCurrentDate();
    }, [prayer.date])
  );

  const handleDateChange = async (date) => {
    const formattedDate = formatDate(date);
    setPrayer((prev) => ({ ...prev, date: formattedDate }));
  };

  const togglePrayer = (prayerName) => {
    const updatedPrayer = {
      ...prayer,
      salat: {
        ...prayer.salat,
        [prayerName]: !prayer.salat[prayerName],
      },
      // Set default rakaat when enabling a prayer
      rakaat: {
        ...prayer.rakaat,
        [prayerName]: prayer.salat[prayerName] 
          ? prayer.rakaat[prayerName] 
          : prayerNames.find(p => p.name === prayerName)?.defaultRakaat || 0,
      },
    };
    setPrayer(updatedPrayer);
    savePrayerData(updatedPrayer);
  };

  const openRakaatModal = (prayerName) => {
    setCurrentPrayer(prayerName);
    setTempRakaat(prayer.rakaat[prayerName].toString());
    setModalVisible(true);
  };

  const saveRakaat = async () => {
    const rakaatNum = parseInt(tempRakaat) || 0;
    const updatedPrayer = {
      ...prayer,
      rakaat: {
        ...prayer.rakaat,
        [currentPrayer]: rakaatNum,
      },
    };
    setPrayer(updatedPrayer);
    await savePrayerData(updatedPrayer);
    setModalVisible(false);
  };

  const handleCreateNewEntry = async () => {
    const newEntry = {
      ...initialPrayerState,
      date: prayer.date,
    };
    setPrayer(newEntry);
    await savePrayerData(newEntry);
    setFound(true);
  };

  const handleToggleJamaat = async (prayerName) => {
    const updatedPrayer = {
      ...prayer,
      jamaat: {
        ...prayer.jamaat,
        [prayerName]: !prayer.jamaat[prayerName],
      },
    };
    setPrayer(updatedPrayer);
    await savePrayerData(updatedPrayer);
  };

  return (
    <ScrollView style={{ backgroundColor: "#ffffff" }}>
      <View style={styles.container}>
        <PrayerCalendar
          selectedDate={new Date(prayer.date)}
          onDateChange={handleDateChange}
        />

        {!found ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>
              {prayer.date} তারিখে কোন ডাটা পাওয়া যায়নি
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
            <Text style={styles.sectionTitle}>নামাজ ট্র্যাকার</Text>

            <View style={styles.prayerRow}>
              {prayerNames.filter(p => p.name !== "tahajjud" && p.name !== "nafil").map((prayerItem) => (
                <PrayerSwitch
                  key={prayerItem.name}
                  label={prayerItem.label}
                  isActive={prayer.salat[prayerItem.name]}
                  onPress={() => togglePrayer(prayerItem.name)}
                />
              ))}
            </View>
            
            <TahajjudPrayerSwitch
              isActive={prayer.salat.tahajjud}
              onPress={() => togglePrayer("tahajjud")}
            />
            
            <NafilPrayerSwitch
              isActive={prayer.salat.nafil}
              onPress={() => togglePrayer("nafil")}
            />

            {Object.entries(prayer.salat).some(([_, value]) => value) && (
              <View style={styles.prayerDetails}>
                <Text style={styles.detailsTitle}>নামাজের বিবরণ</Text>
                {prayerNames.map(
                  (prayerItem) =>
                    prayer.salat[prayerItem.name] && (
                      <PrayerDetailItem
                        key={prayerItem.name}
                        label={prayerItem.label}
                        rakaat={prayer.rakaat[prayerItem.name]}
                        isJamaat={prayerItem.name !== "tahajjud" && prayerItem.name !== "nafil" ? prayer.jamaat[prayerItem.name] : false}
                        onEdit={() => openRakaatModal(prayerItem.name)}
                        onToggleJamaat={prayerItem.name !== "tahajjud" && prayerItem.name !== "nafil" ? 
                          () => handleToggleJamaat(prayerItem.name) : null}
                        showJamaatToggle={prayerItem.name !== "tahajjud" && prayerItem.name !== "nafil"}
                      />
                    )
                )}
              </View>
            )}
          </>
        )}

        <RakaatModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={saveRakaat}
          title={prayerNames.find((p) => p.name === currentPrayer)?.label}
          value={tempRakaat}
          onChangeText={setTempRakaat}
        />
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
  },
  prayerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 15,
  },
  prayerDetails: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 15,
  },
  detailsTitle: {
    fontFamily: "bangla_bold",
    fontSize: 16,
    color: "#037764",
    marginBottom: 15,
    textAlign: "center",
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
});