import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FridayAmolCalendar from '../../components/FridayAmolCalender';
import convertToBanglaNumbers from '../../utils/convertToBanglaNumber';

const amolNames = [
  { id: 1, name: 'amol_1', label: 'সূরা কাহফ তিলওয়াত', target: 1 },
  { id: 2, name: 'amol_2', label: 'দরুদে ইবরাহিম', target: 100 },
  { id: 3, name: 'amol_3', label: 'আস্তাগফিরুল্লা-হ', target: 1000 },
  { id: 4, name: 'amol_4', label: 'জুমার দিনের দরুদ (আসরের নামাযের পর)', target: 80 }
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

const initialAmolState = {
  date: getTodayDate(),
  count: {
    amol_1: 0,
    amol_2: 0,
    amol_3: 0,
    amol_4: 0,
  }
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
    console.error('Error loading amol data:', error);
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
    console.error('Error saving amol data:', error);
  }
}

export default function FridayAmol() {
  const router = useRouter();
  const [amol, setAmol] = useState(initialAmolState);
  const [found, setFound] = useState(true);

  useEffect(() => {
    const loadDataForCurrentDate = async () => {
      const data = await loadAmolData(amol.date);
      if (data) {
        setAmol(data);
        setFound(true);
      } else {
        if (amol.date === getTodayDate()) {
          setFound(true);
        } else {
          setFound(false);
          setAmol((prev) => ({ ...initialAmolState, date: prev.date }));
        }
      }
    };
    loadDataForCurrentDate();
  }, [amol.date]);

  const handleDateChange = async (date) => {
    const formattedDate = formatDate(date);
    setAmol((prev) => ({ ...prev, date: formattedDate }));
  };

  const handleCreateNewEntry = async () => {
    const newEntry = {
      ...initialAmolState,
      date: amol.date,
    };
    setAmol(newEntry);
    await saveAmolData(newEntry);
    setFound(true);
  };

  const navigateToCountScreen = (amolType) => {
    router.push({
      pathname: '/pages/friday-amol-count',
      params: {
        amolType,
        date: amol.date,
        currentCount: amol.count[amolType] || 0,
      }
    });
  };

  return (
    <ScrollView style={{ backgroundColor: '#ffffff' }}>
      <View style={styles.container}>
        <FridayAmolCalendar
          selectedDate={new Date(amol.date)}
          onDateChange={handleDateChange}
        />

        {!found ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>
              {amol.date} তারিখে কোন ডাটা পাওয়া যায়নি
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
            <Text style={styles.sectionTitle}>জুমার আমল ট্র্যাকার</Text>
            
            {amolNames.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.amolItem}
                onPress={() => navigateToCountScreen(item.name)}
              >
                <Text style={styles.amolLabel}>{item.label}</Text>
                <View style={styles.countContainer}>
                  <Text style={styles.countText}>
                    {convertToBanglaNumbers(amol.count[item.name] || 0)}/{convertToBanglaNumbers(item.target)}
                  </Text>
                  <Text style={styles.countPercentage}>
                    {convertToBanglaNumbers(Math.round(((amol.count[item.name] || 0) / item.target) * 100))}%
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
  amolItem: {
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
  amolLabel: {
    fontFamily: 'bangla_medium',
    color: '#037764',
  },
  countContainer: {
    alignItems: 'flex-end',
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