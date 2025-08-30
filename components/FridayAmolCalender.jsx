// FridayAmolCalender.js (updated)
import { Calendar } from "react-native-calendars";
import formatDate from "../utils/formatDate";

export default function FridayAmolCalendar({ selectedDate, onDateChange }) {
  const today = formatDate(new Date());
  
  // Check if a date is Friday (day 5 in JavaScript, where 0=Sunday)
  const isFriday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 5;
  };

  // Get the most recent Friday before today
  const getLastFriday = () => {
    const date = new Date();
    while (date.getDay() !== 5) {
      date.setDate(date.getDate() - 1);
    }
    return formatDate(date);
  };

  const lastFriday = getLastFriday();

  // Generate marked dates with proper restrictions
  const getMarkedDates = () => {
    const markedDates = {};
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      
      if (isFriday(dateStr) && new Date(dateStr) <= new Date()) {
        // Enable only past and current Fridays
        markedDates[dateStr] = { 
          disabled: false
        };
      } else {
        // Disable all other dates
        markedDates[dateStr] = { 
          disabled: true,
          disableTouchEvent: true
        };
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Highlight selected date
    if (markedDates[formatDate(selectedDate)]) {
      markedDates[formatDate(selectedDate)] = {
        ...markedDates[formatDate(selectedDate)],
        selected: true,
        selectedColor: '#037764',
        selectedTextColor: '#ffffff'
      };
    }

    // Highlight today if it's Friday
    if (isFriday(today)) {
      markedDates[today] = {
        ...markedDates[today],
        today: true,
        textColor: '#ffffff',
        backgroundColor: '#037764'
      };
    }

    return markedDates;
  };

  return (
    <Calendar
      theme={{
        todayTextColor: isFriday(today) ? '#ffffff' : '#cbd5e0',
        arrowColor: "#037764",
        dayTextColor: '#2d3748',
        textDisabledColor: '#cbd5e0',
        monthTextColor: '#037764',
        textDayFontFamily: 'bangla_medium',
        textMonthFontFamily: 'bangla_bold',
        textDayHeaderFontFamily: 'bangla_medium',
      }}
      markedDates={getMarkedDates()}
      onDayPress={(day) => {
        // Only allow selecting enabled Fridays
        if (isFriday(day.dateString) && new Date(day.dateString) <= new Date()) {
          onDateChange(new Date(day.dateString));
        }
      }}
      disableAllTouchEventsForDisabledDays={true}
      initialDate={lastFriday}
      current={lastFriday}
    />
  );
}