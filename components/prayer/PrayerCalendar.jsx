import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import formatDate from "../../utils/formatDate";
const PROFILE_FILE = `${FileSystem.documentDirectory}app_dir/user_data.json`;

export default function PrayerCalendar({ selectedDate, onDateChange }) {
  const today = formatDate(new Date());
  const selectedFormatted = formatDate(new Date(selectedDate));
  const [minDate, setMinDate] = useState(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(PROFILE_FILE);
        if (!fileInfo.exists) {
          throw new Error("প্রোফাইল ডাটা পাওয়া যায়নি");
        }

        const fileContents = await FileSystem.readAsStringAsync(PROFILE_FILE);
        const data = JSON.parse(fileContents);
        
        // Set the minimum selectable date to the createdAt date
        if (data.createdAt) {
          const createdAtDate = new Date(data.createdAt);
          setMinDate(formatDate(createdAtDate));
        }
      } catch (err) {
        console.error("প্রোফাইল ডাটা লোড করতে সমস্যা:", err);
      }
    };

    loadProfileData();
  }, []);

  const markedDates = {
    [today]: {
      textColor: "#037764",
      backgroundColor: "#e6fffa",
    },
    [selectedFormatted]: {
      selected: true,
      selectedColor: "#037764",
      selectedTextColor: "#ffffff",
    },
  };

  // If today is selected, combine the styles
  if (today === selectedFormatted) {
    markedDates[today] = {
      selected: true,
      selectedColor: "#037764",
      selectedTextColor: "#ffffff",
      textColor: "#ffffff",
    };
  }

  // Function to handle day press with date restriction
  const handleDayPress = (day) => {
    if (!minDate) return; // Don't allow selection until minDate is loaded
    
    const pressedDate = new Date(day.dateString);
    const minSelectableDate = new Date(minDate);
    const todayDate = new Date(today);
    
    // Check if pressed date is before createdAt date
    if (pressedDate < minSelectableDate) {
      Alert.alert(
        "পুর্বের ডেট আপডেট করা যাবে না",
        "আপনার অ্যাকাউন্ট তৈরির তারিখের পূর্বের কোন ডেট আপডেট করা সম্ভব নয়।",
        [{ text: "ঠিক আছে" }]
      );
      return;
    }
    
    // Check if pressed date is in the future
    if (pressedDate > todayDate) {
      Alert.alert(
        "অগ্রিম ডেট আপডেট করা যাবে না",
        "ভবিষ্যতের কোন ডেট আপডেট করা সম্ভব নয়। শুধুমাত্র আজকের এবং অতীতের ডেট আপডেট করা যাবে।",
        [{ text: "ঠিক আছে" }]
      );
      return;
    }
    
    // Only allow selection if the pressed date is on or after minDate and on or before today
    if (pressedDate >= minSelectableDate && pressedDate <= todayDate) {
      onDateChange(pressedDate);
    }
  };

  return (
    <Calendar
      theme={{
        todayTextColor: "#037764",
        arrowColor: "#037764",
        dayTextColor: "#2d3748",
        textDisabledColor: "#cbd5e0",
        monthTextColor: "#037764",
        textDayFontFamily: "bangla_medium",
        textMonthFontFamily: "bangla_bold",
        textDayHeaderFontFamily: "bangla_medium",
      }}
      markedDates={markedDates}
      onDayPress={handleDayPress}
      // Set both minDate and maxDate to restrict selection range
      minDate={minDate || today} // Fallback to today if minDate not loaded yet
      maxDate={today}
      // Disable future months scrolling if needed
      // enableSwipeMonths={false}
    />
  );
}