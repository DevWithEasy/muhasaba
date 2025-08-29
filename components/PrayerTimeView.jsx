import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  NetInfo,
  StyleSheet,
  Text,
  View,
} from "react-native";
import calculatePrayerSlots from "../utils/calculatePrayerSlots";
import convertToBanglaNumbers from "../utils/convertToBanglaNumber";
import getAddressString from "../utils/getAddressString";

export default function PrayerTimeView() {
  const [location, setLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerSlots, setPrayerSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  // Check network status
  const checkNetworkStatus = async () => {
    const netInfoState = await NetInfo.fetch();
    setIsOnline(netInfoState.isConnected);
  };

  // Retrieve user location from AsyncStorage
  const getSavedLocation = async () => {
    try {
      const appDir = `${FileSystem.documentDirectory}app_dir`;
      const fileUri = `${appDir}/user_data.json`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const userData = JSON.parse(fileContent);
        if (userData.location) {
          return userData.location;
        }
      }
      return null;
    } catch (error) {
      console.error("Error reading location:", error);
      return null;
    }
  };

  // Save prayer times to AsyncStorage with timestamp
  const savePrayerTimes = async (timings) => {
    try {
      const dataToSave = {
        timings,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem("prayerTimes", JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving prayer times:", error);
    }
  };

  // Get saved prayer times from AsyncStorage
  const getSavedPrayerTimes = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("prayerTimes");
      if (jsonValue !== null) {
        const data = JSON.parse(jsonValue);
        setLastUpdated(data.lastUpdated);
        return data.timings;
      }
      return null;
    } catch (error) {
      console.error("Error reading prayer times:", error);
      return null;
    }
  };

  // Fetch prayer times from API
  const fetchPrayerTimes = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`
      );
      const data = await response.json();
      const timings = data.data.timings;

      setPrayerTimes(timings);
      const slots = calculatePrayerSlots(timings);
      setPrayerSlots(slots);
      await savePrayerTimes(timings);
      setLastUpdated(new Date().toISOString());
      calculateCurrentPrayerSlot(slots);
      return true;
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      return false;
    }
  };

  // Calculate current prayer slot and remaining time
  const calculateCurrentPrayerSlot = (slots) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    let activeSlot = null;
    let remainingMinutes = 0;

    for (const slot of slots) {
      const [startHours, startMins] = slot.start.split(":").map(Number);
      const [endHours, endMins] = slot.end.split(":").map(Number);

      const startTimeInMinutes = startHours * 60 + startMins;
      let endTimeInMinutes = endHours * 60 + endMins;

      // Handle overnight slots (like tahajjud)
      if (endTimeInMinutes < startTimeInMinutes) {
        endTimeInMinutes += 1440; // Add 24 hours
      }

      // Check if current time is within this slot
      let currentTimeForComparison = currentTimeInMinutes;
      if (
        endTimeInMinutes > 1440 &&
        currentTimeInMinutes < startTimeInMinutes
      ) {
        currentTimeForComparison += 1440;
      }

      if (
        currentTimeForComparison >= startTimeInMinutes &&
        currentTimeForComparison < endTimeInMinutes
      ) {
        activeSlot = slot;
        remainingMinutes = endTimeInMinutes - currentTimeForComparison;
        break;
      }
    }

    setCurrentSlot(activeSlot);
    setTimeRemaining(remainingMinutes);
  };

  // Format last updated time
  const formatLastUpdated = (isoString) => {
    if (!isoString) return "অজানা";

    const date = new Date(isoString);
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const timeString = date.toLocaleTimeString("bn-BD", options);
    const dateString = date.toLocaleDateString("bn-BD");

    return `${timeString}, ${dateString}`;
  };

  // Format remaining time
  const formatTimeRemaining = (minutes) => {
    if (minutes === null || isNaN(minutes)) return "লোড হচ্ছে...";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ঘন্টা ${mins} মিনিট`;
  };

  // Get prayer name in Bengali
  const getBengaliPrayerName = (name) => {
    const names = {
      fajr: "ফজর",
      morning_restricted: "নিষিদ্ধ সময় (সূর্যোদয় পর)",
      israkh: "ইশরাক",
      dhuhr_restricted: "নিষিদ্ধ সময় (জোহর পূর্ব)",
      dhuhr: "জোহর",
      asr: "আসর",
      maghrib: "মাগরিব",
      isha: "ঈশা",
      midnight: "মধ্যরাত",
      tahajjud: "তাহাজ্জুদ",
    };
    return names[name] || name;
  };

  useEffect(() => {
    checkNetworkStatus();

    const loadData = async () => {
      const savedLocation = await getSavedLocation();
      if (!savedLocation) {
        router.replace("/pages/intro/ask_location");
        return;
      }

      setLocation(savedLocation);

      // Try to fetch new data if online
      if (isOnline) {
        const success = await fetchPrayerTimes(
          savedLocation.latitude,
          savedLocation.longitude
        );
        if (!success) {
          // If online fetch fails, try to load cached data
          const cachedTimes = await getSavedPrayerTimes();
          if (cachedTimes) {
            setPrayerTimes(cachedTimes);
            const slots = calculatePrayerSlots(cachedTimes);
            setPrayerSlots(slots);
            calculateCurrentPrayerSlot(slots);
          }
        }
      } else {
        // Offline - load cached data
        const cachedTimes = await getSavedPrayerTimes();
        if (cachedTimes) {
          setPrayerTimes(cachedTimes);
          const slots = calculatePrayerSlots(cachedTimes);
          setPrayerSlots(slots);
          calculateCurrentPrayerSlot(slots);
        }
      }

      setLoading(false);
    };

    loadData();

    // Update every minute for real-time countdown
    const interval = setInterval(() => {
      if (prayerSlots.length > 0) {
        calculateCurrentPrayerSlot(prayerSlots);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isOnline]);

  if (!location || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (!prayerTimes) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>প্রার্থনার সময় লোড করতে সমস্যা হয়েছে</Text>
        {!isOnline && <Text>অফলাইন মোড: ইন্টারনেট সংযোগ নেই</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ width: "60%" }}>
          {currentSlot && (
            <>
              <Text style={styles.currentPrayerText}>
                {getBengaliPrayerName(currentSlot.name)}
              </Text>
              <Text style={styles.timeRemainingText}>
                শেষ হতে বাকি:{" "}
                {convertToBanglaNumbers(formatTimeRemaining(timeRemaining))}
              </Text>
              <Text style={styles.slotTimeText}>
                {convertToBanglaNumbers(
                  `${currentSlot.start} - ${currentSlot.end}`
                )}
              </Text>
            </>
          )}
        </View>
        <View
          style={{
            width: "40%",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Text style={styles.sunTimeText}>সর্বশেষ আপডেট</Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "bangla_regular",
              color: "#666",
            }}
          >
            {formatLastUpdated(lastUpdated)}
          </Text>
          {!isOnline && (
            <Text style={[styles.sunTimeText, { color: "red" }]}>
              (অফলাইন মোড)
            </Text>
          )}
        </View>
      </View>
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10,
          fontFamily: "bangla_regular",
          color: "#666",
          textAlign: "center",
          marginTop: 8,
        }}
      >
        {getAddressString(location.address)}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          ...styles.sunTimeContainer,
        }}
      >
        <View style={{ width: "50%" }}>
          <Text style={styles.sunTimeText}>
            সূর্যোদয়: {convertToBanglaNumbers(prayerTimes.Sunrise)}
          </Text>
          <Text style={styles.sunTimeText}>
            সূর্যাস্ত: {convertToBanglaNumbers(prayerTimes.Sunset)}
          </Text>
        </View>
        <View style={{ width: "50%" }}>
          <Text style={styles.sunTimeText}>
            সেহেরি: {convertToBanglaNumbers(prayerTimes.Fajr)}
          </Text>
          <Text style={styles.sunTimeText}>
            ইফতার: {convertToBanglaNumbers(prayerTimes.Maghrib)}
          </Text>
        </View>
      </View>

      <View style={styles.prayerTimesContainer}>
        {prayerSlots
          .filter((slot) =>
            ["fajr", "dhuhr", "asr", "maghrib", "isha"].includes(slot.name)
          )
          .map((slot) => (
            <View
              key={slot.name}
              style={[
                styles.prayerTimeItem,
                currentSlot?.name === slot.name && styles.activePrayer,
              ]}
            >
              <View />
              <Text
                style={[
                  styles.prayerNameTime,
                  currentSlot?.name === slot.name &&
                    styles.activePrayerNameTime,
                ]}
              >
                {getBengaliPrayerName(slot.name)}
              </Text>
              <Text
                style={[
                  styles.prayerNameTime,
                  currentSlot?.name === slot.name &&
                    styles.activePrayerNameTime,
                ]}
              >
                {convertToBanglaNumbers(slot.start)}
              </Text>
            </View>
          ))}
      </View>

      {!isOnline && (
        <Text
          style={[styles.sunTimeText, { textAlign: "center", marginTop: 10 }]}
        >
          ইন্টারনেট সংযোগ নেই। সর্বশেষ সংরক্ষিত সময় দেখানো হচ্ছে।
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  currentPrayerText: {
    fontSize: 18,
    fontFamily: "bangla_bold",
    marginBottom: 5,
    color: "#037764ff",
  },
  timeRemainingText: {
    color: "#666",
    fontFamily: "bangla_regular",
  },
  slotTimeText: {
    color: "#666",
    fontSize: 12,
    fontFamily: "bangla_regular",
  },
  sunTimeContainer: {
    marginVertical: 10,
  },
  sunTimeText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "bangla_regular",
  },
  prayerTimesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  prayerTimeItem: {
    width: "18%",
    alignItems: "center",
    backgroundColor: "#e9e9e9ff",
    borderRadius: 10,
    paddingVertical: 5,
  },
  activePrayer: {
    backgroundColor: "#037764ff",
  },
  prayerNameTime: {
    fontSize: 14,
    textAlign: "center",
    color: "#757575ff",
    fontFamily: "bangla_regular",
  },
  activePrayerNameTime: {
    fontSize: 14,
    textAlign: "center",
    color: "#fff",
    fontFamily: "bangla_regular",
  },
});
