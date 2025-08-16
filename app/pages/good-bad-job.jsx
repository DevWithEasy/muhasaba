import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrayerCalendar from '../../components/prayer/PrayerCalendar';
import convertToBanglaNumbers from '../../utils/convertToBanglaNumber';

const jobTypes = [
  { id: 1, name: 'good_job', label: 'ভালো কাজ করেছেন', iconColor: '#037764' },
  { id: 2, name: 'bad_job', label: 'খারাপ কাজ করেছেন', iconColor: '#e00b2f' },
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

const initialJobState = {
  date: getTodayDate(),
  count: {
    good_job: 0,
    bad_job: 0,
  }
};

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/good_bad_job_data.json`;

async function ensureDataFileExists() {
  const fileInfo = await FileSystem.getInfoAsync(DATA_FILE_PATH);
  if (!fileInfo.exists) {
    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify([]));
  }
}

async function loadJobData(date) {
  await ensureDataFileExists();
  try {
    const fileContent = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const data = JSON.parse(fileContent);
    return data.find((item) => item.date === date) || null;
  } catch (error) {
    console.error('Error loading job data:', error);
    return null;
  }
}

async function saveJobData(newData) {
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
    console.error('Error saving job data:', error);
  }
}

export default function GoodBadJob() {
  const [job, setJob] = useState(initialJobState);
  const [found, setFound] = useState(true);

  useEffect(() => {
    const loadDataForCurrentDate = async () => {
      const data = await loadJobData(job.date);
      if (data) {
        setJob(data);
        setFound(true);
      } else {
        if (job.date === getTodayDate()) {
          setFound(true);
        } else {
          setFound(false);
          setJob((prev) => ({ ...initialJobState, date: prev.date }));
        }
      }
    };
    loadDataForCurrentDate();
  }, [job.date]);

  const handleDateChange = async (date) => {
    const formattedDate = formatDate(date);
    setJob((prev) => ({ ...prev, date: formattedDate }));
  };

  const handleCreateNewEntry = async () => {
    const newEntry = {
      ...initialJobState,
      date: job.date,
    };
    setJob(newEntry);
    await saveJobData(newEntry);
    setFound(true);
  };

  const updateJobCount = async (jobType, increment) => {
    const newCount = Math.max(0, job.count[jobType] + (increment ? 1 : -1));
    const updatedJob = {
      ...job,
      count: {
        ...job.count,
        [jobType]: newCount,
      },
    };
    setJob(updatedJob);
    await saveJobData(updatedJob);
  };

  return (
    <ScrollView style={{ backgroundColor: '#ffffff' }}>
      <View style={styles.container}>
        <PrayerCalendar
          selectedDate={new Date(job.date)}
          onDateChange={handleDateChange}
        />

        {!found ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>
              {job.date} তারিখে কোন ডাটা পাওয়া যায়নি
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
            <Text style={styles.sectionTitle}>ভালো মন্দ কাজের ট্র্যাকার</Text>
            
            {jobTypes.map((item) => (
              <View
                key={item.id}
                style={styles.jobItem}
              >
                <Text style={styles.jobLabel}>
                  {item.label} - {convertToBanglaNumbers(job.count[item.name])} টি
                </Text>
                <View style={styles.countContainer}>
                  <TouchableOpacity 
                    onPress={() => updateJobCount(item.name, true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name='add-circle-outline' 
                      size={28} 
                      color={item.iconColor}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => updateJobCount(item.name, false)}
                    activeOpacity={0.7}
                    disabled={job.count[item.name] === 0}
                  >
                    <Ionicons 
                      name='remove-circle-outline' 
                      size={28} 
                      color={job.count[item.name] === 0 ? '#cccccc' : item.iconColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>
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
  jobItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  jobLabel: {
    fontFamily: 'bangla_bold',
    color: '#037764',
    flex: 1,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginLeft: 10,
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