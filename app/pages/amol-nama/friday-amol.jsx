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

const filePath = FileSystem.documentDirectory + "app_dir/friday_data.json";

export default function FridayAmol() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        const jsonData = JSON.parse(fileContent);
        setData(jsonData);
      } else {
        // ডেমো ডেটা
        setData([
          { count: { amol_1: 1, amol_2: 1, amol_3: 1, amol_4: 1 }, date: "2025-09-05" },
          { count: { amol_1: 1, amol_4: 1 }, date: "2025-08-29" },
          { count: { amol_1: 1, amol_2: 1, amol_3: 1 }, date: "2025-08-22" },
          { count: { amol_1: 1, amol_2: 1, amol_3: 1, amol_4: 1 }, date: "2025-08-15" },
          { count: { amol_2: 1, amol_3: 1, amol_4: 1 }, date: "2025-08-08" },
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

  // তারিখটি শুক্রবার কিনা চেক করা
  const isFriday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 5; // 0 = Sunday, 5 = Friday
  };

  // মাসের মোট আমল গণনা
  const getMonthlyTotal = (month, year) => {
    const monthlyData = filterDataByMonthYear(month, year);
    let total = 0;
    monthlyData.forEach((item) => {
      Object.values(item.count).forEach((count) => {
        total += count;
      });
    });
    return total;
  };

  // তারিখ ফরম্যাট করার ফাংশন (YYYY-MM-DD)
  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  // মাসের শুধুমাত্র শুক্রবারের ডেটা তৈরি করা
  const generateFridayDatesData = () => {
    const fridayDates = [];

    // মাসের দিন সংখ্যা
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

    // বর্তমান মাস এবং বছরের জন্য ফিল্টার করা ডেটা
    const filteredData = filterDataByMonthYear(selectedMonth, selectedYear);

    // আজকের তারিখ
    const today = new Date();
    today.setHours(0, 0, 0, 0); // সময় অংশ শূন্য করে দিন
    const todayFormatted = formatDate(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // মাসের প্রতিটি দিনের জন্য লুপ (১ থেকে শুরু)
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(selectedYear, selectedMonth, day);
      const currentDate = new Date(dateString);
      
      // শুধুমাত্র শুক্রবারের ডেটা প্রসেস করা
      if (isFriday(dateString)) {
        const existingData = filteredData.find(
          (item) => item.date === dateString
        );

        // আজকের তারিখ হলে তুলনা করব
        let comparison = null;
        if (dateString === todayFormatted) {
          // গত সপ্তাহের শুক্রবারের তারিখ বের করা
          const lastFriday = new Date(currentDate);
          lastFriday.setDate(lastFriday.getDate() - 7);
          const lastFridayFormatted = formatDate(
            lastFriday.getFullYear(),
            lastFriday.getMonth(),
            lastFriday.getDate()
          );

          // গত সপ্তাহের শুক্রবারের ডেটা খুঁজে বের করা
          let lastFridayData = null;
          if (data) {
            lastFridayData = data.find((item) => item.date === lastFridayFormatted);
          }

          // তুলনা হিসাব করা (মোট আমলের ভিত্তিতে)
          let todayTotal = 0;
          let lastFridayTotal = 0;
          
          if (existingData) {
            todayTotal = Object.values(existingData.count).reduce((sum, count) => sum + count, 0);
          }
          
          if (lastFridayData) {
            lastFridayTotal = Object.values(lastFridayData.count).reduce((sum, count) => sum + count, 0);
          }
          
          comparison = todayTotal - lastFridayTotal;
        }

        fridayDates.push({
          date: dateString,
          counts: existingData ? existingData.count : {},
          total: existingData ? Object.values(existingData.count).reduce((sum, count) => sum + count, 0) : 0,
          comparison: comparison,
          isToday: dateString === todayFormatted,
        });
      }
    }

    return fridayDates.reverse(); 
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

  // আমলের নাম পেতে
  const getAmolName = (key) => {
    const names = {
      amol_1: "সূরা কাহফ তিলওয়াত",
      amol_2: "দরুদে ইবরাহিম",
      amol_3: "আস্তাগফিরুল্লাহ",
      amol_4: "জুমার দিনের দরুদ (আসরের নামাযের পর)",
    };
    return names[key] || key;
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
        <ActivityIndicator size="large" color="#037764" />
        <Text style={{fontFamily : 'bangla_regular'}}>ডেটা লোড হচ্ছে...</Text>
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

  const fridayDatesData = data ? generateFridayDatesData() : [];
  const currentMonthTotal = getMonthlyTotal(selectedMonth, selectedYear);

  const { month: prevMonth, year: prevYear } = getPreviousMonthYear();
  const previousMonthTotal = getMonthlyTotal(prevMonth, prevYear);

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
            {getMonthName(prevMonth)} {prevYear} মোট:
          </Text>
          <Text style={styles.summaryValue}>
            {previousMonthTotal.toLocaleString("bn-BD")} বার
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            {getMonthName(selectedMonth)} {selectedYear} মোট:
          </Text>
          <Text style={styles.summaryValue}>
            {currentMonthTotal.toLocaleString("bn-BD")} বার
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        {getMonthName(selectedMonth)} {selectedYear} এর জুমার আমল পরিসংখ্যান
      </Text>

      <ScrollView style={styles.listContainer}>
        {fridayDatesData.length > 0 ? (
          fridayDatesData.map((item, index) => (
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
                <Text
                  style={[
                    styles.countText,
                    item.isToday && styles.todayCountText,
                  ]}
                >
                  {item.total.toLocaleString("bn-BD")} বার
                </Text>
              </View>

              {/* আমলগুলির বিস্তারিত */}
              {Object.keys(item.counts).length > 0 && (
                <View style={styles.amolDetails}>
                  {Object.entries(item.counts).map(([key, count]) => (
                    <View key={key} style={styles.amolDetailItem}>
                      <Text style={styles.amolDetailName}>{getAmolName(key)}:</Text>
                      <Text style={styles.amolDetailCount}>{count.toLocaleString("bn-BD")} বার</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* তুলনা তথ্য শুধুমাত্র দেখান যখন এটি null না হয় এবং আজকের তারিখ হয় */}
              {item.comparison !== null && item.isToday && (
                <View style={styles.comparisonContainer}>
                  <Text style={styles.comparisonText}>
                    গত জুমার তুলনায়{" "}
                    {Math.abs(item.comparison).toLocaleString("bn-BD")} বার
                    {item.comparison > 0 ? " বেশি" : " কম"}
                  </Text>
                  <Ionicons
                    name={item.comparison > 0 ? "arrow-up" : "arrow-down"}
                    size={16}
                    color={item.comparison > 0 ? "#4CAF50" : "#F44336"}
                  />
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>এই মাসের জন্য কোন জুমার ডেটা নেই</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ecf0f2',
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
    marginBottom: 8,
  },
  dateText: {
    fontFamily: "bangla_semibold",
  },
  todayText: {
    color: "#2E7D32",
    fontFamily: "bangla_bold",
  },
  countText: {
    color: "#4CAF50",
    fontFamily: "bangla_semibold",
  },
  todayCountText: {
    color: "#2E7D32",
    fontFamily: "bangla_bold",
  },
  amolDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  amolDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  amolDetailName: {
    fontSize: 14,
    color: "#666",
    fontFamily: "bangla_regular",
  },
  amolDetailCount: {
    fontSize: 14,
    color: "#037764",
    fontFamily: "bangla_semibold",
  },
  comparisonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  comparisonText: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
    fontFamily: "bangla_regular",
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