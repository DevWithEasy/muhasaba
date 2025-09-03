import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";
import getLocalDateString from "../../utils/getLocalDateString";
export default function HadithCalculation({ hadith }) {
  const router = useRouter();
  const today = new Date();
  
  // গতকালের তারিখ পেতে
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = getLocalDateString(yesterday);
  
  // আজকের তারিখ ফরম্যাট করা
  const todayFormatted = getLocalDateString(today);

  // আজকের হাদিসের তথ্য বের করা
  const todayHadith = hadith?.find((item) => item.date === todayFormatted);
  const previousHadith = hadith?.find((item) => item.date === yesterdayFormatted);

  // আজকের হাদিস অধ্যয়ন পরিমাণ
  const todayCount = todayHadith?.read?.count || 0;

  // গতকালের হাদিস অধ্যয়ন পরিমাণ
  const previousCount = previousHadith?.read?.count || 0;

  // আজকের vs গতকালের তুলনা
  const isIncreased = todayCount >= previousCount;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/pages/amol-nama/hadith-read")}
    >
      <Ionicons 
        name={isIncreased ? "arrow-up-circle" : "arrow-down-circle"} 
        size={30} 
        color={isIncreased ? "#037764" : "#f50828ff"} 
      />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.title}>হাদিস পরিসংখ্যান</Text>
        <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
          আজকে: {convertToBanglaNumbers(todayCount)} হাদিস
        </Text>
        {previousHadith && (
          <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
            গতকাল: {convertToBanglaNumbers(previousCount)} হাদিস
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