import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Calculation from "../../components/calculation/Calculation";
import JammatWarning from "../../components/prayer/JamaatWarning";
import PrayerTimeView from "../../components/prayer/PrayerTimeView";
import calculatePrayerSlots from "../../utils/calculatePrayerSlots";

const APP_DIR = FileSystem.documentDirectory + "app_dir";

export default function Index() {
  const [data, setData] = useState(null);
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  const data_files = {
    user: "user_data.json",
    salah: "salah_data.json",
    quran: "quran_data.json",
    hadith: "hadith_data.json",
    darood: "darood_data.json",
    istighfar: "istighfar_data.json",
    tasbih: "tasbih_data.json",
    friday: "friday_data.json",
    goodBadJob: "good_bad_job_data.json",
    donation: "donation_data.json",
  };

  // নেটওয়ার্ক স্ট্যাটাস চেক
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // প্রার্থনার সময় ফেচ করার ফাংশন
  const fetchPrayerTimes = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`
      );
      const data = await response.json();
      const timings = data.data.timings;

      // AsyncStorage-এ সেভ করুন
      const dataToSave = {
        timings,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem("prayerTimes", JSON.stringify(dataToSave));

      return timings;
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      return null;
    }
  };

  // সেভ করা প্রার্থনার সময় পড়ুন
  const getSavedPrayerTimes = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("prayerTimes");
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Error reading prayer times:", error);
      return null;
    }
  };

  const checkFiles = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(APP_DIR);
      if (!dirInfo.exists) {
        setError("App directory not found");
        setLoading(false);
        return;
      }

      const filesData = {};
      await Promise.all(
        Object.entries(data_files).map(async ([key, filename]) => {
          const filePath = `${APP_DIR}/${filename}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          filesData[key] = fileInfo.exists ? JSON.parse(await FileSystem.readAsStringAsync(filePath)) : [];
        })
      );
      
      setData(filesData);

      // প্রার্থনার সময় হ্যান্ডেল করুন
      if (filesData.user && filesData.user.location) {
        const { latitude, longitude } = filesData.user.location;
        
        let prayerTimesData = null;
        let lastUpdated = null;
        
        if (isOnline) {
          prayerTimesData = await fetchPrayerTimes(latitude, longitude);
          lastUpdated = new Date().toISOString();
        }
        
        if (!prayerTimesData) {
          const savedData = await getSavedPrayerTimes();
          if (savedData) {
            prayerTimesData = savedData.timings;
            lastUpdated = savedData.lastUpdated;
          }
        }

        if (prayerTimesData) {
          const slots = calculatePrayerSlots(prayerTimesData);
          setPrayerData({
            timings: prayerTimesData,
            slots,
            location: filesData.user.location,
            lastUpdated
          });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { checkFiles(); }, [isOnline]));

  const handleSwipeLeft = (screen) => {
    router.push(`/pages/${screen}`);
  };

  const handleSwipeRight = (screen) => {
    router.push(`/pages/amol-nama/${screen}`);
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.container}><Text style={styles.error}>Error: {error}</Text></View>;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <PrayerTimeView 
          prayerData={prayerData} 
          isOnline={isOnline}
        />
        {data && <JammatWarning salah={data.salah} />}
        
        {data && (
          <Calculation 
            data={data} 
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 10,
  },
  error: {
    color: 'red',
  },
});