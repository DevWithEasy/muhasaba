import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function DonationSwitch({ isActive, onPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>আপনি কি আজ দান করেছেন?</Text>
      <TouchableOpacity 
        style={[styles.switch, isActive ? styles.active : styles.inactive]}
        onPress={onPress}
      >
        <Ionicons 
          name={isActive ? "checkmark-circle" : "close-circle"} 
          size={20} 
          color={isActive ? "#037764" : "#e53e3e"} 
        />
        <Text style={styles.text}>{isActive ? "হ্যাঁ করেছি" : "না করিনি"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    margin: 5,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  label: {
    fontFamily: 'bangla_regular',
    flex: 1
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1
  },
  active: {
    backgroundColor: '#f0fdf4',
    borderColor: '#037764'
  },
  inactive: {
    backgroundColor: '#fff5f5',
    borderColor: '#e53e3e'
  },
  text: {
    fontFamily: 'bangla_medium',
    fontSize: 12,
    marginLeft: 5
  }
};