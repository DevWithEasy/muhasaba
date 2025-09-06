import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import getAddressString from "../../utils/getAddressString";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

export default function PrayerTimeView({ prayerData, isOnline }) {
  const [currentSlot, setCurrentSlot] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // বর্তমান প্রার্থনা স্লট ক্যালকুলেট করুন
  const calculateCurrentPrayerSlot = (slots) => {
    if (!slots) return;

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

      if (endTimeInMinutes < startTimeInMinutes) {
        endTimeInMinutes += 1440;
      }

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

  // ফরম্যাট ফাংশনগুলো
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

  const formatTimeRemaining = (minutes) => {
    if (minutes === null || isNaN(minutes)) return "লোড হচ্ছে...";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ঘন্টা ${mins} মিনিট`;
  };

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
    if (prayerData?.slots) {
      calculateCurrentPrayerSlot(prayerData.slots);
      
      // প্রতি মিনিটে আপডেট
      const interval = setInterval(() => {
        calculateCurrentPrayerSlot(prayerData.slots);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [prayerData]);

  if (!prayerData) {
    return (
      <View style={styles.container}>
        <Text>প্রার্থনার সময় লোড হচ্ছে...</Text>
      </View>
    );
  }

  const { timings, location, lastUpdated, slots } = prayerData;

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between"}}>
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
        {location && location.address ? getAddressString(location.address) : "লোকেশন লোড হচ্ছে..."}
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
            সূর্যোদয়: {convertToBanglaNumbers(timings.Sunrise)}
          </Text>
          <Text style={styles.sunTimeText}>
            সূর্যাস্ত: {convertToBanglaNumbers(timings.Sunset)}
          </Text>
        </View>
        <View style={{ width: "50%" }}>
          <Text style={styles.sunTimeText}>
            সেহেরি: {convertToBanglaNumbers(timings.Fajr)}
          </Text>
          <Text style={styles.sunTimeText}>
            ইফতার: {convertToBanglaNumbers(timings.Maghrib)}
          </Text>
        </View>
      </View>

      <View style={styles.prayerTimesContainer}>
        {slots
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