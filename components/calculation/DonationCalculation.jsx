import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import getLocalDateString from "../../utils/getLocalDateString";

export default function DonationCalculation({ donation }) {
  const router = useRouter();
  const today = new Date();

  // গতকালের তারিখ পেতে
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = getLocalDateString(yesterday);

  // আজকের তারিখ ফরম্যাট করা
  const todayFormatted = getLocalDateString(today);

  // আজকের দানের তথ্য বের করা
  const todayDonation = donation?.find((item) => item.date === todayFormatted);
  const previousDonation = donation?.find(
    (item) => item.date === yesterdayFormatted
  );

  // আজকের দানের অবস্থা
  const todayStatus = todayDonation?.donated || false;

  // গতকালের দানের অবস্থা
  const previousStatus = previousDonation?.donated || false;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/pages/amol-nama/donation")}
    >
      <Ionicons
        name={todayStatus ? "arrow-up-circle" : "arrow-down-circle"} 
        size={30}
        color={todayStatus ? "#037764" : "#f50828ff"}
      />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={styles.title}>দান পরিসংখ্যান</Text>
        <Text
          style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}
        >
          আজকে: {todayStatus ? "দান করেছেন" : "দান করেননি"}
        </Text>
        <Text
          style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}
        >
          গতকাল: {previousStatus ? "দান করেছেন" : "দান করেননি"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  title: {
    fontFamily: "bangla_bold",
  },
});
