import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";
import getLocalDateString from "../../utils/getLocalDateString";

export default function SalahCalculation({ salah }) {
  const router = useRouter();
  const today = new Date();
  
  // গতকালের তারিখ পেতে
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = getLocalDateString(yesterday);
  
  // আজকের তারিখ ফরম্যাট করা
  const todayFormatted = getLocalDateString(today);

  // আজকের সালাতের তথ্য বের করা
  const todaySalah = salah?.find((item) => item.date === todayFormatted);
  const previousSalah = salah?.find((item) => item.date === yesterdayFormatted);

  // ফরজ নামাজের নামগুলির তালিকা (নফল ও তাহাজ্জুদ বাদে)
  const farzPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  // আজকের মোট ফরজ ওয়াক্ত গণনা (নফল ও তাহাজ্জুদ বাদে)
  const todayWaqt = todaySalah ? 
    farzPrayers.filter(prayer => todaySalah.salat[prayer] === true).length : 0;

  // আজকের মোট রাকাআত গণনা (সব নামাজ সহ)
  const todayRakaat = todaySalah ? (
    todaySalah.rakaat.fajr + 
    todaySalah.rakaat.dhuhr + 
    todaySalah.rakaat.asr + 
    todaySalah.rakaat.maghrib + 
    todaySalah.rakaat.isha +
    todaySalah.rakaat.nafil +
    todaySalah.rakaat.tahajjud
  ) : 0;

  // গতকালের মোট ফরজ ওয়াক্ত গণনা (নফল ও তাহাজ্জুদ বাদে)
  const previousWaqt = previousSalah ? 
    farzPrayers.filter(prayer => previousSalah.salat[prayer] === true).length : 0;

  // গতকালের মোট রাকাআত গণনা (সব নামাজ সহ)
  const previousRakaat = previousSalah ? (
    previousSalah.rakaat.fajr + 
    previousSalah.rakaat.dhuhr + 
    previousSalah.rakaat.asr + 
    previousSalah.rakaat.maghrib + 
    previousSalah.rakaat.isha +
    previousSalah.rakaat.nafil +
    previousSalah.rakaat.tahajjud
  ) : 0;

  // আজকের vs গতকালের তুলনা
  const isWaqtIncreased = todayWaqt >= previousWaqt;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/pages/amol-nama/prayer")}
    >
      <Ionicons 
        name={isWaqtIncreased ? "arrow-up-circle" : "arrow-down-circle"} 
        size={30} 
        color={isWaqtIncreased ? "#037764" : "#f50828ff"} 
      />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.title}>সালাত পরিসংখ্যান</Text>
        <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
          আজকে: {convertToBanglaNumbers(todayWaqt)} ওয়াক্ত, {convertToBanglaNumbers(todayRakaat)} রাকাআত
        </Text>
        {previousSalah && (
          <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
            গতকাল: {convertToBanglaNumbers(previousWaqt)} ওয়াক্ত, {convertToBanglaNumbers(previousRakaat)} রাকাআত
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