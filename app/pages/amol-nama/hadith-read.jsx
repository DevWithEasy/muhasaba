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

const hadithPath = FileSystem.documentDirectory + "app_dir/hadith_data.json";

export default function HadithRead() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const fileInfo = await FileSystem.getInfoAsync(hadithPath);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(hadithPath);
        const jsonData = JSON.parse(fileContent);
        setData(jsonData);
      } else {
        setError("ফাইল পাওয়া যায়নি।");
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

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const filterDataByMonthYear = (month, year) => {
    if (!data) return [];
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === month && itemDate.getFullYear() === year;
    });
  };

  const getMonthlyTotalDays = (month, year) => {
    const monthlyData = filterDataByMonthYear(month, year);
    return monthlyData.filter((item) => item.read.status).length;
  };

  const getMonthlyTotalCount = (month, year) => {
    const monthlyData = filterDataByMonthYear(month, year);
    return monthlyData.reduce(
      (total, item) => total + (item.read.count || 0),
      0
    );
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const generateAllDatesData = () => {
    const allDates = [];
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const filteredData = filterDataByMonthYear(selectedMonth, selectedYear);
    const today = new Date();
    const todayFormatted = formatDate(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(selectedYear, selectedMonth, day);
      const existingData = filteredData.find(
        (item) => item.date === dateString
      );

      let comparison = null;
      if (dateString === todayFormatted) {
        const yesterday = new Date(selectedYear, selectedMonth, day - 1);
        const yesterdayFormatted = formatDate(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate()
        );
        let yesterdayData = null;
        if (data) {
          yesterdayData = data.find((item) => item.date === yesterdayFormatted);
        }
        if (yesterdayData && existingData) {
          comparison = existingData.read.count - yesterdayData.read.count;
        } else if (yesterdayData && !existingData) {
          comparison = -yesterdayData.read.count;
        } else if (!yesterdayData && existingData) {
          comparison = existingData.read.count;
        }
      }

      allDates.push({
        date: dateString,
        read: existingData ? existingData.read : { count: 0, status: false },
        comparison,
        isToday: dateString === todayFormatted,
      });
    }
    return allDates.reverse();
  };

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

  const yearOptions = [2025, 2026, 2027, 2028, 2029, 2030];
  const monthOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

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
        <Text style={{ fontFamily: "bangla_regular" }}>ডেটা লোড হচ্ছে...</Text>
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
  const currentMonthTotalDays = getMonthlyTotalDays(
    selectedMonth,
    selectedYear
  );
  const currentMonthTotalCount = getMonthlyTotalCount(
    selectedMonth,
    selectedYear
  );
  const { month: prevMonth, year: prevYear } = getPreviousMonthYear();
  const previousMonthTotalDays = getMonthlyTotalDays(prevMonth, prevYear);
  const previousMonthTotalCount = getMonthlyTotalCount(prevMonth, prevYear);

  return (
    <View style={styles.container}>
      {/* মাস এবং বছর সিলেক্টর */}
      <View style={styles.selectorContainer}>
        <View style={styles.pickerContainer}>
          <Text
            style={{
              fontFamily: "bangla_semibold",
              fontSize: 16,
              marginRight: 12,
            }}
          >
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
          <Text
            style={{
              fontFamily: "bangla_semibold",
              fontSize: 16,
              marginRight: 8,
            }}
          >
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
            {previousMonthTotalDays.toLocaleString("bn-BD")} দিন
          </Text>
          <Text style={styles.summaryCount}>
            {previousMonthTotalCount.toLocaleString("bn-BD")} পৃষ্ঠা
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            {getMonthName(selectedMonth)} {selectedYear}:
          </Text>
          <Text style={styles.summaryValue}>
            {currentMonthTotalDays.toLocaleString("bn-BD")} দিন
          </Text>
          <Text style={styles.summaryCount}>
            {currentMonthTotalCount.toLocaleString("bn-BD")} পৃষ্ঠা
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        {getMonthName(selectedMonth)} {selectedYear} এর হাদিস পড়ার পরিসংখ্যান
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
                <View
                  style={[
                    styles.statusContainer,
                    {
                      backgroundColor: item.read.status ? "#4CAF50" : "#F44336",
                    },
                  ]}
                >
                  {item.read.status ? (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.countText}>
                        {item.read.count.toLocaleString("bn-BD")} পৃষ্ঠা
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={18} color="#fff" />
                      <Text style={styles.notReadText}>পড়া হয়নি</Text>
                    </>
                  )}
                </View>
              </View>
              {item.comparison !== null && (
                <View style={styles.comparisonContainer}>
                  <Text style={styles.comparisonText}>
                    গতকালের তুলনায়{" "}
                    {Math.abs(item.comparison).toLocaleString("bn-BD")} পৃষ্ঠা
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
  summaryCount: {
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
    marginBottom: 8,
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
    backgroundColor: "#f0f0f0",
    padding: 2,
    borderRadius: 4,
    justifyContent: "center",
  },
  countText: {
    marginLeft: 4,
    color: "#ffffff",
    fontFamily: "bangla_regular",
    fontSize: 12,
  },
  notReadText: {
    marginLeft: 4,
    color: "#ffffff",
    fontFamily: "bangla_regular",
    fontSize: 12,
  },
  comparisonContainer: {
    flexDirection: "row",
    alignItems: "center",
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
