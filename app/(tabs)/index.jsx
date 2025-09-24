import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Calculation from "../../components/calculation/Calculation";
import JammatWarning from "../../components/prayer/JamaatWarning";
import PrayerTimeView from "../../components/prayer/PrayerTimeView";
import calculatePrayerSlots from "../../utils/calculatePrayerSlots";
import notificationTimes from "../../utils/notifiactionTimes";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";


const APP_DIR = FileSystem.documentDirectory + "app_dir";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

export default function Index() {
  const [data, setData] = useState(null);
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  const notificationListener = useRef();
  const responseListener = useRef();

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
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Notification Setup and Listener Setup
  useEffect(() => {
    registerForNotification();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received: ", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Response Received: ", response);
        const route = response.notification.request.content.data?.route;
        if (route) {
          router.push(route);
        } else {
          router.push("/");
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const registerForNotification = async () => {
    try {
      if (Device.isDevice && Platform.OS !== "web") {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          await Notifications.requestPermissionsAsync();
        }
      }
    } catch (error) {
      console.log("Error getting a push token", error);
    }
  };

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

  // নোটিফিকেশন সিডিউল করার ফাংশন (আজকের জন্য)
  const scheduleTodayNotifications = async (notifications) => {
    // Clear all previously scheduled notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();

    for (const notif of notifications) {
      // প্রার্থনার সময় থেকে আজকের তারিখসহ Date অবজেক্ট তৈরি করুন
      const [hour, minute] = notif.time.split(":").map(Number);
      const triggerDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0
      );

      // আগামীকের জন্য ফজরের নোটিফিকেশন হলে triggerDate আগের বা পরের দিন হতে পারে তাই সেটার সময় সেট করি
      if (notif.name === "fajr_next_day") {
        // আগামীকের ফজরের জন্য সময় triggerDate কে ১ দিন বাড়িয়ে দিন হিসেবে অ্যাডজাস্ট করুন
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      // যদি সময় ইতিমধ্যেই অত হয়ে থাকে তাহলে notification সিডিউল করবেন না
      if (triggerDate <= now) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notif.content.title,
          body: notif.content.body,
          sound: true,
          data: { route: notif.route },
        },
        trigger: { type: "date", date: triggerDate },
      });
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
          filesData[key] = fileInfo.exists
            ? JSON.parse(await FileSystem.readAsStringAsync(filePath))
            : [];
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
            lastUpdated,
          });

          // আজকের ফজরের সময়ের Date অবজেক্ট তৈরি
          const now = new Date();
          const [fajrHour, fajrMin] = prayerTimesData.Fajr.split(":").map(Number);
          const fajrDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), fajrHour, fajrMin, 0);

          // আগামীকের ফজরের সময় হিসাব (একদিন বাড়িয়ে)
          const nextDayFajrDateTime = new Date(fajrDateTime);
          if (fajrDateTime <= now) {
            nextDayFajrDateTime.setDate(nextDayFajrDateTime.getDate() + 1);
          } else {
            // ফজরের সময় এখনো পর হয়নি, তাই আগামীকের ফজরের জন্য পরের দিনের সময়ও একদিন বাড়াতে হবে
            nextDayFajrDateTime.setDate(nextDayFajrDateTime.getDate() + 1);
          }
          // আগামীকের দিনের জন্য ফজরের সময়ের স্ট্রিং
          const nextDayFajrTimeStr = `${String(nextDayFajrDateTime.getHours()).padStart(2, "0")}:${String(
            nextDayFajrDateTime.getMinutes()
          ).padStart(2, "0")}`;

          // নোটিফিকেশনগুলো সিডিউল করব, আগামীকের ফজরের সময়সহ
          const todaysNotifications = notificationTimes(prayerTimesData, nextDayFajrTimeStr);
          await scheduleTodayNotifications(todaysNotifications);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkFiles();
    }, [isOnline])
  );

  const handleSwipeLeft = (screen) => {
    router.push(`/pages/${screen}`);
  };

  const handleSwipeRight = (screen) => {
    router.push(`/pages/amol-nama/${screen}`);
  };

  if (loading)
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  if (error)
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <PrayerTimeView prayerData={prayerData} isOnline={isOnline} />
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
    color: "red",
  },
});
