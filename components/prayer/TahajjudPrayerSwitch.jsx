import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function TahajjudPrayerSwitch({ isActive, onPress }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 5,
        borderTopColor: "#e2e8f0",
        paddingLeft: 5,
        borderTopWidth: 1,
        marginTop: 5,
        paddingTop: 15,
      }}
    >
      <Text style={{ fontFamily: "bangla_regular", flex: 1 }}>
        আপনি কি তাহাজ্জুদ নামাজ পড়েছেন?
      </Text>
      <TouchableOpacity
        style={[
          styles.prayerSwitch,
          isActive ? styles.prayerActive : styles.prayerInactive,
        ]}
        onPress={onPress}
      >
        {isActive ? (
          <Ionicons name="checkmark-circle" size={18} color="#037764" />
        ) : (
          <Ionicons name="information-circle" size={18} color="#8f8f8f" />
        )}
        <Text style={styles.prayerText}>তাহাজ্জুদ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  prayerSwitch: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    width: 80,
    marginLeft: 10,
    justifyContent: "center",
  },
  prayerActive: {
    borderColor: "#037764",
    backgroundColor: "#f0fdf4",
  },
  prayerInactive: {
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  prayerText: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    marginLeft: 3,
  },
};