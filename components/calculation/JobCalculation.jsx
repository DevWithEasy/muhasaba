import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";
import getLocalDateString from "../../utils/getLocalDateString";

export default function JobCalculation({ goodBadJob }) {
  const router = useRouter();
  const today = new Date();
  
  // গতকালের তারিখ পেতে
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = getLocalDateString(yesterday);
  
  // আজকের তারিখ ফরম্যাট করা
  const todayFormatted = getLocalDateString(today);

  // আজকের কাজের তথ্য বের করা
  const todayJob = goodBadJob?.find((item) => item.date === todayFormatted);
  const previousJob = goodBadJob?.find((item) => item.date === yesterdayFormatted);

  // আজকের ভালো ও মন্দ কাজের পরিমাণ
  const todayGoodJob = todayJob?.count?.good_job || 0;
  const todayBadJob = todayJob?.count?.bad_job || 0;
  const todayNetJob = todayGoodJob - todayBadJob;

  // গতকালের ভালো ও মন্দ কাজের পরিমাণ
  const previousGoodJob = previousJob?.count?.good_job || 0;
  const previousBadJob = previousJob?.count?.bad_job || 0;
  const previousNetJob = previousGoodJob - previousBadJob;

  // আজকের vs গতকালের তুলনা (নেট ভালো কাজের ভিত্তিতে)
  const isIncreased = todayNetJob > previousNetJob;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/pages/amol-nama/good-bad-job")}
    >
      <Ionicons 
        name={isIncreased ? "arrow-up-circle" : "arrow-down-circle"} 
        size={30} 
        color={isIncreased ? "#037764" : "#f50828ff"} 
      />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.title}>কাজের পরিসংখ্যান</Text>
        <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
          আজকে: {convertToBanglaNumbers(todayNetJob)} নেট স্কোর
        </Text>
        {todayJob && (
          <Text style={{ fontFamily: "bangla_regular", fontSize: 10, color: "gray" }}>
            (ভালো: {convertToBanglaNumbers(todayGoodJob)}, মন্দ: {convertToBanglaNumbers(todayBadJob)})
          </Text>
        )}
        {previousJob && (
          <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
            গতকাল: {convertToBanglaNumbers(previousNetJob)} নেট স্কোর
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