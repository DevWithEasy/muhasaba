import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

export default function PrayerSwitch({ 
  label, 
  isActive, 
  onPress 
}) {
  return (
    <TouchableOpacity
      style={[
        styles.prayerSwitch,
        isActive ? styles.prayerActive : styles.prayerInactive
      ]}
      onPress={onPress}
    >
      {isActive ? (
        <Ionicons name="checkmark-circle" size={18} color="#037764" />
      ) : (
        <Ionicons name="information-circle" size={18} color="#8f8f8f" />
      )}
      <Text style={styles.prayerText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = {
  prayerSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center'
  },
  prayerActive: {
    borderColor: '#037764',
    backgroundColor: '#f0fdf4',
  },
  prayerInactive: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  prayerText: {
    fontFamily: 'bangla_regular',
    fontSize: 12,
    marginLeft: 3,
  }
};