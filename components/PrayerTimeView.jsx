import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  NetInfo,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import getAddressString from "../utils/getAddressString";

export default function PrayerTimeView() {
  const [location, setLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPrayer, setCurrentPrayer] = useState(null);
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
      const jsonValue = await AsyncStorage.getItem("userLocation");
      return jsonValue != null ? JSON.parse(jsonValue) : null;
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
      await savePrayerTimes(timings);
      setLastUpdated(new Date().toISOString());
      calculateCurrentPrayer(timings);

      return true;
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      return false;
    }
  };

  // Calculate current prayer and remaining time
  const calculateCurrentPrayer = (timings) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayerTimesArray = [
      { name: "Fajr", time: timings.Fajr },
      { name: "Sunrise", time: timings.Sunrise },
      { name: "Dhuhr", time: timings.Dhuhr },
      { name: "Asr", time: timings.Asr },
      { name: "Maghrib", time: timings.Maghrib },
      { name: "Isha", time: timings.Isha },
    ];

    // Convert prayer times to minutes
    const prayersInMinutes = prayerTimesArray.map((prayer) => {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      return {
        name: prayer.name,
        timeInMinutes: hours * 60 + minutes,
      };
    });

    let activePrayer = null;
    let remaining = 0;

    // Check between prayers
    for (let i = 0; i < prayersInMinutes.length - 1; i++) {
      if (
        currentTime >= prayersInMinutes[i].timeInMinutes &&
        currentTime < prayersInMinutes[i + 1].timeInMinutes
      ) {
        activePrayer = prayersInMinutes[i];
        remaining = prayersInMinutes[i + 1].timeInMinutes - currentTime;
        break;
      }
    }

    // Check after Isha (until next Fajr)
    if (
      !activePrayer &&
      currentTime >= prayersInMinutes[prayersInMinutes.length - 1].timeInMinutes
    ) {
      activePrayer = prayersInMinutes[prayersInMinutes.length - 1];
      remaining = 1440 - currentTime + prayersInMinutes[0].timeInMinutes;
    }

    // Check before Fajr (after midnight but before Fajr)
    if (!activePrayer && currentTime < prayersInMinutes[0].timeInMinutes) {
      activePrayer = prayersInMinutes[prayersInMinutes.length - 1]; // Isha of previous day
      remaining = prayersInMinutes[0].timeInMinutes - currentTime;
    }

    setCurrentPrayer(activePrayer);
    setTimeRemaining(remaining);
  };

  // Format last updated time
  const formatLastUpdated = (isoString) => {
    if (!isoString) return "অজানা";
    const date = new Date(isoString);
    return (
      date.toLocaleTimeString("bn-BD") + `, ` + date.toLocaleDateString("bn-BD")
    );
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
      Fajr: "ফজর",
      Sunrise: "সূর্যোদয়",
      Dhuhr: "যোহর",
      Asr: "আসর",
      Maghrib: "মাগরিব",
      Isha: "ঈশা",
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
            calculateCurrentPrayer(cachedTimes);
          }
        }
      } else {
        // Offline - load cached data
        const cachedTimes = await getSavedPrayerTimes();
        if (cachedTimes) {
          setPrayerTimes(cachedTimes);
          calculateCurrentPrayer(cachedTimes);
        }
      }

      setLoading(false);
    };

    loadData();

    // Update every minute for real-time countdown
    const interval = setInterval(() => {
      if (prayerTimes) {
        calculateCurrentPrayer(prayerTimes);
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
          {currentPrayer && (
            <>
              <Text style={styles.currentPrayerText}>
                {getBengaliPrayerName(currentPrayer.name)}
              </Text>
              <Text style={styles.timeRemainingText}>
                শেষ হতে বাকি: {formatTimeRemaining(timeRemaining)}
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
            সূর্যোদয়: {prayerTimes.Sunrise}
          </Text>
          <Text style={styles.sunTimeText}>
            সূর্যাস্ত: {prayerTimes.Sunset}
          </Text>
        </View>
        <View style={{ width: "50%" }}>
          <Text style={styles.sunTimeText}>সেহেরি: {prayerTimes.Fajr}</Text>
          <Text style={styles.sunTimeText}>ইফতার: {prayerTimes.Maghrib}</Text>
        </View>
      </View>

      <View style={styles.prayerTimesContainer}>
        {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((prayer) => (
          <View
            key={prayer}
            style={[
              styles.prayerTimeItem,
              currentPrayer?.name === prayer && styles.activePrayer,
            ]}
          >
            <View />
            <Text
              style={[
                styles.prayerNameTime,
                currentPrayer?.name === prayer && styles.activePrayerNameTime,
              ]}
            >
              {getBengaliPrayerName(prayer)}
            </Text>
            <Text
              style={[
                styles.prayerNameTime,
                currentPrayer?.name === prayer && styles.activePrayerNameTime,
              ]}
            >
              {prayerTimes[prayer]}
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
  container: { padding: 10, backgroundColor: "#ffffff", borderRadius: 8 },
  currentPrayerText: {
    fontSize: 18,
    fontFamily: "bangla_bold",
    marginBottom: 5,
    color: "#037764ff",
  },
  timeRemainingText: {
    color: "#666",
    marginBottom: 10,
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
  prayer: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e9e9e9ff",
    marginBottom: 5,
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
