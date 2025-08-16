import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import PrayerCalendar from '../../components/prayer/PrayerCalendar';
import convertToBanglaNumbers from '../../utils/convertToBanglaNumber';

const istighfarNames = [
  { id: 1, name: 'sayyidul_istighfar', label: 'সাইয়্যিদুল ইস্তেগফার', target: 2 },
  { id: 2, name: 'astaghfirullah', label: 'আস্তাগফিরুল্লা-হ', target: 100 },
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

const initialIstighfarState = {
  date: getTodayDate(),
  count: {
    sayyidul_istighfar: 0,
    astaghfirullah: 0,
  }
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
    console.error('Error loading istighfar data:', error);
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
    console.error('Error saving istighfar data:', error);
  }
}

export default function Istighfar() {
  const router = useRouter();
  const [istighfar, setIstighfar] = useState(initialIstighfarState);
  const [found, setFound] = useState(true);

  useEffect(() => {
    const loadDataForCurrentDate = async () => {
      const data = await loadIstighfarData(istighfar.date);
      if (data) {
        setIstighfar(data);
        setFound(true);
      } else {
        if (istighfar.date === getTodayDate()) {
          setFound(true);
        } else {
          setFound(false);
          setIstighfar((prev) => ({ ...initialIstighfarState, date: prev.date }));
        }
      }
    };
    loadDataForCurrentDate();
  }, [istighfar.date]);

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
      pathname: '/pages/istighfar-count',
      params: {
        istighfarType,
        date: istighfar.date,
        currentCount: istighfar.count[istighfarType] || 0,
      }
    });
  };

  return (
    <ScrollView style={{ backgroundColor: '#ffffff' }}>
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
              >
                <Text style={styles.istighfarLabel}>{item.label}</Text>
                <View style={styles.countContainer}>
                  <Text style={styles.countText}>
                    {convertToBanglaNumbers(istighfar.count[item.name] || 0)}/{convertToBanglaNumbers(item.target)}
                  </Text>
                  <Text style={styles.countPercentage}>
                    {convertToBanglaNumbers(Math.round(((istighfar.count[item.name] || 0) / item.target) * 100))}%
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
  istighfarItem: {
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
  istighfarLabel: {
    fontFamily: 'bangla_medium',
    color: '#037764',
  },
  countContainer: {
    alignItems: 'flex-end',
  },
  countText: {
    fontFamily: 'bangla_regular',
    fontSize: 14,
  },
  countPercentage: {
    fontFamily: 'bangla_medium',
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