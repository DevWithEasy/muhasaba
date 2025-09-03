import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const daroodPath = FileSystem.documentDirectory + "app_dir/donation_data.json";

export default function Donation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const fileInfo = await FileSystem.getInfoAsync(daroodPath);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(daroodPath);
        const jsonData = JSON.parse(fileContent);
        setData(jsonData);
      } else {
        // ডেমো ডেটা
        setData([
          { date: "2025-09-02", donated: true },
          { date: "2025-09-01", donated: true },
          { date: "2025-09-05", donated: true },
          { date: "2025-09-07", donated: false },
          { date: "2025-09-10", donated: true },
          { date: "2025-09-15", donated: true },
          { date: "2025-09-20", donated: false },
          { date: "2025-09-25", donated: true },
          { date: "2025-08-30", donated: true },
        ]);
      }
    } catch (error) {
      setError("ডেটা পড়তে সমস্যা: " + error.message);
      console.error("Error checking file info:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // মাসের দিন সংখ্যা নির্ণয়
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // মাস এবং বছর ভিত্তিক ডেটা ফিল্টার করার ফাংশন
  const filterDataByMonthYear = (month, year) => {
    if (!data) return [];

    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === month && itemDate.getFullYear() === year;
    });
  };

  // মাসের মোট দান গণনা
  const getMonthlyDonationCount = (month, year) => {
    const monthlyData = filterDataByMonthYear(month, year);
    return monthlyData.filter((item) => item.donated).length;
  };

  // তারিখ ফরম্যাট করার ফাংশন (YYYY-MM-DD)
  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  // মাসের সমস্ত তারিখের ডেটা তৈরি করা
  const generateAllDatesData = () => {
    const allDates = [];

    // মাসের দিন সংখ্যা
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

    // বর্তমান মাস এবং বছরের জন্য ফিল্টার করা ডেটা
    const filteredData = filterDataByMonthYear(selectedMonth, selectedYear);

    // আজকের তারিখ
    const today = new Date();
    const todayFormatted = formatDate(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // মাসের প্রতিটি দিনের জন্য লুপ (১ থেকে শুরু)
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(selectedYear, selectedMonth, day);

      const existingData = filteredData.find(
        (item) => item.date === dateString
      );

      allDates.push({
        date: dateString,
        donated: existingData ? existingData.donated : false,
        isToday: dateString === todayFormatted, // আজকের তারিখ চিহ্নিত করা
      });
    }

    return allDates.reverse(); // তারিখের উল্টো ক্রমে দেখানোর জন্য
  };

  // মাসের নাম পেতে
  const getMonthName = (monthIndex) => {
    const months = [
      "জানুয়ারি",
      "ফেব্রুয়ারি",
      "মার্চ",
      "এপ্রিল",
      "মে",
      "জুন",
      "জুলাই",
      "আগস্ট",
      "সেপ্টেম্বর",
      "অক্টোবর",
      "নভেম্বর",
      "ডিসেম্বর",
    ];
    return months[monthIndex];
  };

  // বছর পরিবর্তনের অপশন
  const yearOptions = [2025, 2026, 2027, 2028, 2029, 2030];

  // মাস পরিবর্তনের অপশন
  const monthOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // আগের মাস এবং বছর বের করা
  const getPreviousMonthYear = () => {
    let prevMonth = selectedMonth - 1;
    let prevYear = selectedYear;

    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear = selectedYear - 1;
    }

    return { month: prevMonth, year: prevYear };
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>ডেটা লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const allDatesData = data ? generateAllDatesData() : [];
  const currentMonthDonations = getMonthlyDonationCount(selectedMonth, selectedYear);
  const totalDaysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const donationPercentage = totalDaysInMonth > 0 
    ? Math.round((currentMonthDonations / totalDaysInMonth) * 100) 
    : 0;

  const { month: prevMonth, year: prevYear } = getPreviousMonthYear();
  const previousMonthDonations = getMonthlyDonationCount(prevMonth, prevYear);
  const prevTotalDaysInMonth = getDaysInMonth(prevMonth, prevYear);
  const prevDonationPercentage = prevTotalDaysInMonth > 0 
    ? Math.round((previousMonthDonations / prevTotalDaysInMonth) * 100) 
    : 0;

  return (
    <View style={styles.container}>
      {/* মাস এবং বছর সিলেক্টর */}
      <View style={styles.selectorContainer}>
        <View style={styles.pickerContainer}>
          <Text style={{ fontFamily: "bangla_semibold", fontSize: 16, marginRight: 12 }}>
            মাস:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pickerScroll}
          >
            {monthOptions.map((month) => (
              <Text
                key={month}
                style={[
                  styles.selectorOption,
                  selectedMonth === month && styles.selectedOption,
                ]}
                onPress={() => setSelectedMonth(month)}
              >
                {getMonthName(month)}
              </Text>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={{ fontFamily: "bangla_semibold", fontSize: 16, marginRight: 8 }}>
            বছর:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pickerScroll}
          >
            {yearOptions.map((year) => (
              <Text
                key={year}
                style={[
                  styles.selectorOption,
                  selectedYear === year && styles.selectedOption,
                ]}
                onPress={() => setSelectedYear(year)}
              >
                {year}
              </Text>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* মাসের মোট এবং আগের মাসের মোট */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            {getMonthName(prevMonth)} {prevYear}:
          </Text>
          <Text style={styles.summaryValue}>
            {previousMonthDonations}/{prevTotalDaysInMonth} দিন
          </Text>
          <Text style={styles.percentageText}>
            ({prevDonationPercentage}%)
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            {getMonthName(selectedMonth)} {selectedYear}:
          </Text>
          <Text style={styles.summaryValue}>
            {currentMonthDonations}/{totalDaysInMonth} দিন
          </Text>
          <Text style={styles.percentageText}>
            ({donationPercentage}%)
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        {getMonthName(selectedMonth)} {selectedYear} এর দান পরিসংখ্যান
      </Text>

      <ScrollView style={styles.listContainer}>
        {allDatesData.length > 0 ? (
          allDatesData.map((item, index) => (
            <View
              key={index}
              style={[styles.listItem, item.isToday && styles.todayItem]}
            >
              <View style={styles.dateContainer}>
                <Text
                  style={[styles.dateText, item.isToday && styles.todayText]}
                >
                  {new Date(item.date).getDate().toLocaleString("bn-BD")}{" "}
                  {getMonthName(selectedMonth)},{" "}
                  {selectedYear.toLocaleString("bn-BD")}
                  {item.isToday && " (আজ)"}
                </Text>
                <View style={styles.statusContainer}>
                  {item.donated ? (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  ) : (
                    <Ionicons name="close-circle" size={24} color="#F44336" />
                  )}
                  <Text
                    style={[
                      styles.statusText,
                      item.donated ? styles.donatedText : styles.notDonatedText,
                    ]}
                  >
                    {item.donated ? "দান করা হয়েছে" : "দান করা হয়নি"}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>এই মাসের জন্য কোন ডেটা নেই</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 16,
    color: "#555",
    fontFamily: "bangla_regular",
  },
  selectorContainer: {
    marginBottom: 16,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pickerScroll: {
    maxHeight: 40,
  },
  selectorOption: {
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    fontFamily: "bangla_regular",
  },
  selectedOption: {
    backgroundColor: "#037764",
    color: "white",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1.2,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontFamily: "bangla_regular",
  },
  summaryValue: {
    fontSize: 16,
    color: "#037764",
    fontFamily: "bangla_semibold",
  },
  percentageText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "bangla_regular",
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 0.8,
  },
  todayItem: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontFamily: "bangla_semibold",
  },
  todayText: {
    color: "#2E7D32",
    fontFamily: "bangla_bold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginLeft: 8,
    fontFamily: "bangla_semibold",
  },
  donatedText: {
    color: "#4CAF50",
  },
  notDonatedText: {
    color: "#F44336",
  },
  errorText: {
    color: "#F44336",
    textAlign: "center",
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    fontFamily: "bangla_regular",
  },
});