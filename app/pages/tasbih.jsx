import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import PrayerCalendar from '../../components/prayer/PrayerCalendar';
import convertToBanglaNumbers from '../../utils/convertToBanglaNumber';

const tasbihNames = [
  { id: 1, name: 'tasbih_1', label: 'আলহামদু লিল্লাহ', target: 100 },
  { id: 2, name: 'tasbih_2', label: 'সুবহানাল্লাহ', target: 100 },
  { id: 3, name: 'tasbih_3', label: 'লা ইলাহা ইল্লাল্লাহ', target: 100 },
  { id: 4, name: 'tasbih_4', label: 'সুব্‌হানাল্লা-হি ওয়াবিহামদিহী', target: 100 },
  { id: 5, name: 'tasbih_5', label: 'লা ইলা-হা ইল্লাল্লা-হু ওয়াহদাহু লা শারীকা লাহু লাহুল মুলকু ওয়া লাহুল হামদু ওয়া হুয়া ‘আলা কুল্লি শাইইন ক্বাদীর', target: 10 },
  { id: 6, name: 'tasbih_6', label: 'সুব্‌হানাল্লা-হি ওয়া বিহামদিহী, সুব্‌হানাল্লা-হিল ‘আযীম', target: 10 },
];

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDate = () => {
  return formatDate(new Date());
};

const initialTasbihState = {
  date: getTodayDate(),
  count: {
    tasbih_1: 0,
    tasbih_2: 0,
    tasbih_3: 0,
    tasbih_4: 0,
    tasbih_5: 0,
    tasbih_6: 0,
  }
};

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/tasbih_data.json`;

async function ensureDataFileExists() {
  const fileInfo = await FileSystem.getInfoAsync(DATA_FILE_PATH);
  if (!fileInfo.exists) {
    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify([]));
  }
}

async function loadTasbihData(date) {
  await ensureDataFileExists();
  try {
    const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const data = JSON.parse(fileContent);
    return data.find((item) => item.date === date) || null;
  } catch (error) {
    console.error('Error loading tasbih data:', error);
    return null;
  }
}

async function saveTasbihData(newData) {
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
    console.error('Error saving tasbih data:', error);
  }
}

export default function Tasbih() {
  const router = useRouter();
  const [tasbih, setTasbih] = useState(initialTasbihState);
  const [found, setFound] = useState(true);

  useEffect(() => {
    const loadDataForCurrentDate = async () => {
      const data = await loadTasbihData(tasbih.date);
      if (data) {
        setTasbih(data);
        setFound(true);
      } else {
        if (tasbih.date === getTodayDate()) {
          setFound(true);
        } else {
          setFound(false);
          setTasbih((prev) => ({ ...initialTasbihState, date: prev.date }));
        }
      }
    };
    loadDataForCurrentDate();
  }, [tasbih.date]);

  const handleDateChange = async (date) => {
    const formattedDate = formatDate(date);
    setTasbih((prev) => ({ ...prev, date: formattedDate }));
  };

  const handleCreateNewEntry = async () => {
    const newEntry = {
      ...initialTasbihState,
      date: tasbih.date,
    };
    setTasbih(newEntry);
    await saveTasbihData(newEntry);
    setFound(true);
  };

  const navigateToCountScreen = (tasbihType) => {
    const targetTasbih = tasbihNames.find(t => t.name === tasbihType);
    router.push({
      pathname: '/pages/tasbih-count',
      params: {
        tasbihType,
        date: tasbih.date,
        currentCount: tasbih.count[tasbihType] || 0,
        target: targetTasbih.target
      }
    });
  };

  return (
    <ScrollView style={{ backgroundColor: '#ffffff' }}>
      <View style={styles.container}>
        <PrayerCalendar
          selectedDate={new Date(tasbih.date)}
          onDateChange={handleDateChange}
        />

        {!found ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>
              {tasbih.date} তারিখে কোন ডাটা পাওয়া যায়নি
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
            <Text style={styles.sectionTitle}>তাসবীহ ট্র্যাকার</Text>
            
            {tasbihNames.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.tasbihItem}
                onPress={() => navigateToCountScreen(item.name)}
              >
                <Text numberOfLines={1} style={styles.tasbihLabel}>{item.label}</Text>
                <View style={styles.countContainer}>
                  <Text style={styles.countText}>
                    {convertToBanglaNumbers(tasbih.count[item.name] || 0)}/{convertToBanglaNumbers(item.target)}
                  </Text>
                  <Text style={styles.countPercentage}>
                    {convertToBanglaNumbers(Math.round(((tasbih.count[item.name] || 0) / item.target) * 100))}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
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
    fontFamily: 'bangla_medium',
    marginHorizontal: 5,
    borderBottomColor: '#e2e8f0',
    paddingLeft: 5,
    borderBottomWidth: 1,
    marginTop: 5,
    marginBottom: 15,
  },
  tasbihItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tasbihLabel: {
    fontFamily: 'bangla_medium',
    color: '#037764',
    flex: 1,
  },
  countContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  countText: {
    fontFamily: 'bangla_bold',
    fontSize: 12,
  },
  countPercentage: {
    fontFamily: 'bangla_bold',
    fontSize: 12,
    color: '#037764',
    marginTop: 3,
  },
  notFoundContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontFamily: 'bangla_medium',
    fontSize: 16,
    color: '#e53e3e',
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#037764',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  createButtonText: {
    fontFamily: 'bangla_medium',
    color: 'white',
    fontSize: 16,
  },
});