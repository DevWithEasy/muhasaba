import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";
import getLocalDateString from "../../utils/getLocalDateString";

export default function TasbihCalculation({ tasbih }) {
  const router = useRouter();
  const today = new Date();
  
  // গতকালের তারিখ পেতে
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = getLocalDateString(yesterday);
  
  // আজকের তারিখ ফরম্যাট করা
  const todayFormatted = getLocalDateString(today);

  // আজকের তাসবিহের তথ্য বের করা
  const todayTasbih = tasbih?.find((item) => item.date === todayFormatted);
  const previousTasbih = tasbih?.find((item) => item.date === yesterdayFormatted);

  // আজকের মোট তাসবিহ গণনা
  let todayTotal = 0;
  if (todayTasbih?.count) {
    todayTotal = Object.values(todayTasbih.count).reduce((sum, count) => sum + count, 0);
  }
  const todayStatus = todayTotal > 0;

  // গতকালের মোট তাসবিহ গণনা
  let previousTotal = 0;
  if (previousTasbih?.count) {
    previousTotal = Object.values(previousTasbih.count).reduce((sum, count) => sum + count, 0);
  }

  // আজকের vs গতকালের তুলনা
  const isIncreased = todayTotal >= previousTotal;

  // আজকের সবচেয়ে বেশি পড়া তাসবিহ বের করা
  let mostRecitedTasbih = "";
  let mostRecitedCount = 0;
  if (todayTasbih?.count) {
    Object.entries(todayTasbih.count).forEach(([name, count]) => {
      if (count > mostRecitedCount) {
        mostRecitedCount = count;
        mostRecitedTasbih = name;
      }
    });
  }

  // তাসবিহের বাংলা নাম ম্যাপিং
  const tasbihNames = {
    "tasbih_1": "আলহামদু লিল্লাহ",
    "tasbih_2": "সুবহানাল্লাহ",
    "tasbih_3": "লা ইলাহা ইল্লাল্লাহ",
    "tasbih_4": "সুব্‌হানাল্লা-হি ওয়াবিহামদিহী",
    "tasbih_5": "লা ইলা-হা ইল্লাল্লা-হু ওয়াহদাহু লা শারীকা লাহু লাহুল মুলকু ওয়া লাহুল হামদু ওয়া হুয়া ‘আলা কুল্লি শাইইন ক্বাদীর",
    "tasbih_6": "সুব্‌হানাল্লা-হি ওয়া বিহামদিহী, সুব্‌হানাল্লা-হিল ‘আযীম"
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/pages/amol-nama/tasbih")}
    >
      <Ionicons 
        name={isIncreased ? "arrow-up-circle" : "arrow-down-circle"} 
        size={30} 
        color={isIncreased ? "#037764" : "#f50828ff"} 
      />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={styles.title}>তাসবিহ পরিসংখ্যান</Text>
        <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
          আজকে: {convertToBanglaNumbers(todayTotal)} বার
        </Text>
        
        {todayStatus && mostRecitedCount > 0 && (
          <Text numberOfLines={1} style={{ fontFamily: "bangla_regular", fontSize: 10, color: "gray" }}>
            সর্বাধিক: {tasbihNames[mostRecitedTasbih] || mostRecitedTasbih} ({convertToBanglaNumbers(mostRecitedCount)} বার)
          </Text>
        )}
        
        {previousTasbih && (
          <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray", marginTop: 2 }}>
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