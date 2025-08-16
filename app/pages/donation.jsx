import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DonationSwitch from '../../components/DonationSwitch';
import PrayerCalendar from '../../components/prayer/PrayerCalendar';

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
};

const initialDonationState = {
  date: formatDate(new Date()),
  donated: false
};

const DATA_FILE_PATH = `${FileSystem.documentDirectory}app_dir/donation_data.json`;

async function ensureDataFileExists() {
  const fileInfo = await FileSystem.getInfoAsync(DATA_FILE_PATH);
  if (!fileInfo.exists) {
    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify([]));
  }
}

async function loadDonationData(date) {
  await ensureDataFileExists();
  try {
    const content = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    return JSON.parse(content).find(item => item.date === date) || null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

async function saveDonationData(data) {
  await ensureDataFileExists();
  try {
    const content = await FileSystem.readAsStringAsync(DATA_FILE_PATH);
    const allData = JSON.parse(content);
    const index = allData.findIndex(item => item.date === data.date);
    
    if (index >= 0) allData[index] = data;
    else allData.push(data);
    
    await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify(allData));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export default function Donation() {
  const [donation, setDonation] = useState(initialDonationState);
  const [found, setFound] = useState(true);

  useEffect(() => {
    loadData();
  }, [donation.date]);

  const loadData = async () => {
    const data = await loadDonationData(donation.date);
    if (data) {
      setDonation(data);
      setFound(true);
    } else {
      setFound(donation.date === formatDate(new Date()));
      if (!found) setDonation({...initialDonationState, date: donation.date});
    }
  };

  const handleDateChange = (date) => {
    setDonation(prev => ({...prev, date: formatDate(date)}));
  };

  const handleCreateEntry = async () => {
    const newData = {...initialDonationState, date: donation.date};
    setDonation(newData);
    await saveDonationData(newData);
    setFound(true);
  };

  const toggleDonation = async () => {
    const newData = {...donation, donated: !donation.donated};
    setDonation(newData);
    await saveDonationData(newData);
  };

  return (
    <ScrollView style={styles.container}>
      <PrayerCalendar 
        selectedDate={new Date(donation.date)} 
        onDateChange={handleDateChange} 
      />

      {!found ? (
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>
            {donation.date} তারিখে কোন ডাটা নেই
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateEntry}>
            <Text style={styles.createButtonText}>নতুন এন্ট্রি তৈরি করুন</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>দান সদকা ট্র্যাকার</Text>
          <DonationSwitch 
            isActive={donation.donated} 
            onPress={toggleDonation} 
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff'
  },
  sectionTitle: {
    fontFamily: 'bangla_medium',
    margin: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  notFoundContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 20
  },
  notFoundText: {
    fontFamily: 'bangla_medium',
    fontSize: 16,
    color: '#e53e3e',
    marginBottom: 20,
    textAlign: 'center'
  },
  createButton: {
    backgroundColor: '#037764',
    padding: 10,
    borderRadius: 5
  },
  createButtonText: {
    fontFamily: 'bangla_medium',
    color: 'white',
    fontSize: 16
  }
});