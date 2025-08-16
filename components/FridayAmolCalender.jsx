import { Calendar } from "react-native-calendars";
import formatDate from "../utils/formatDate";

export default function PrayerCalendar({ selectedDate, onDateChange }) {
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

  // Generate disabled dates (all non-Fridays, future Fridays, and today if not Friday)
  const getDisabledDates = () => {
    const disabledDates = {};
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // 1 year back
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year forward

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      // Disable if:
      // 1. Not Friday OR
      // 2. Is future Friday OR
      // 3. Is today but not Friday
      if (!isFriday(dateStr) || 
          new Date(dateStr) > new Date() || 
          (dateStr === today && !isFriday(dateStr))) {
        disabledDates[dateStr] = { 
          disabled: true,
          disableTouchEvent: true
        };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return disabledDates;
  };

  const markedDates = {
    ...getDisabledDates(),
    [lastFriday]: {
      selected: true,
      selectedColor: '#037764',
      selectedTextColor: '#ffffff'
    },
    [today]: {
      disabled: !isFriday(today),
      disableTouchEvent: true
    }
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
      markedDates={markedDates}
      onDayPress={(day) => {
        if (isFriday(day.dateString) && new Date(day.dateString) <= new Date()) {
          onDateChange(new Date(day.dateString));
        }
      }}
      disableAllTouchEventsForDisabledDays={true}
      initialDate={lastFriday}
      current={lastFriday} // Force calendar to show last Friday initially
    />
  );
}