import { Calendar } from "react-native-calendars";
import formatDate from "../../utils/formatDate";

export default function PrayerCalendar({ selectedDate, onDateChange }) {
  const today = formatDate(new Date());
  const selectedFormatted = formatDate(new Date(selectedDate));

  const markedDates = {
    [today]: {
      textColor: '#037764',
      backgroundColor: '#e6fffa',
    },
    [selectedFormatted]: {
      selected: true,
      selectedColor: '#037764',
      selectedTextColor: '#ffffff'
    }
  };

  // If today is selected, combine the styles
  if (today === selectedFormatted) {
    markedDates[today] = {
      selected: true,
      selectedColor: '#037764',
      selectedTextColor: '#ffffff',
      textColor: '#ffffff'
    };
  }

  return (
    <Calendar
      theme={{
        todayTextColor: "#037764",
        arrowColor: "#037764",
        dayTextColor: '#2d3748',
        textDisabledColor: '#cbd5e0',
        monthTextColor: '#037764',
        textDayFontFamily: 'bangla_medium',
        textMonthFontFamily: 'bangla_bold',
        textDayHeaderFontFamily: 'bangla_medium',
      }}
      markedDates={markedDates}
      onDayPress={(day) => onDateChange(new Date(day.dateString))}
    />
  );
}