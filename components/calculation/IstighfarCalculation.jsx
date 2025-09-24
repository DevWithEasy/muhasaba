import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";
import getLocalDateString from "../../utils/getLocalDateString";

export default function IstighfarCalculation({ istighfar }) {
  const router = useRouter();
  const today = new Date();
  
  // গতকালের তারিখ পেতে
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = getLocalDateString(yesterday);
  
  // আজকের তারিখ ফরম্যাট করা
  const todayFormatted = getLocalDateString(today);

  // আজকের ইস্তিগফারের তথ্য বের করা
  const todayIstighfar = istighfar?.find((item) => item.date === todayFormatted);
  const previousIstighfar = istighfar?.find((item) => item.date === yesterdayFormatted);

  // আজকের ইস্তিগফার পরিমাণ
  const todayAstaghfirullah = todayIstighfar?.count?.astaghfirullah || 0;
  const todaySayyidul = todayIstighfar?.count?.sayyidul_istighfar || 0;
  const todayTotal = todayAstaghfirullah + todaySayyidul;
  const todayStatus = todayTotal > 0;

  // গতকালের ইস্তিগফার পরিমাণ
  const previousAstaghfirullah = previousIstighfar?.count?.astaghfirullah || 0;
  const previousSayyidul = previousIstighfar?.count?.sayyidul_istighfar || 0;
  const previousTotal = previousAstaghfirullah + previousSayyidul;

  // আজকের vs গতকালের তুলনা
  const isIncreased = todayTotal > previousTotal;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/pages/amol-nama/istighfar")}
    >
      <Ionicons 
        name={isIncreased ? "arrow-up-circle" : "arrow-down-circle"} 
        size={30} 
        color={isIncreased ? "#037764" : "#f50828ff"} 
      />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.title}>ইস্তিগফার পরিসংখ্যান</Text>
        <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
          আজকে: {convertToBanglaNumbers(todayTotal)} বার
        </Text>
        {todayStatus && (
          <Text style={{ fontFamily: "bangla_regular", fontSize: 10, color: "gray" }}>
            (আস্তাগফিরুল্লাহ: {convertToBanglaNumbers(todayAstaghfirullah)}, 
            সাইয়িদুল ইস্তিগফার: {convertToBanglaNumbers(todaySayyidul)})
          </Text>
        )}
        {previousIstighfar && (
          <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
            গতকাল: {convertToBanglaNumbers(previousTotal)} বার
          </Text>
        )}
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