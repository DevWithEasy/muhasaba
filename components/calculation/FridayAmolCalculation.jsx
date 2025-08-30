import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

export default function FridayAmolCalculation({ friday }) {
  const router = useRouter();
  
  if (!friday || friday.length === 0) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => router.push("/pages/friday-amol")}
      >
        <Ionicons name="calendar" size={30} color="#037764" />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.title}>জুমার আমল পরিসংখ্যান</Text>
          <Text style={styles.subtitle}>কোন ডাটা পাওয়া যায়নি</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // তারিখ অনুসারে সাজানো (সবচেয়ে নতুন প্রথম)
  const sortedFriday = [...friday].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // সর্বশেষ দুইটি শুক্রবারের ডাটা
  const lastFriday = sortedFriday[0];
  const previousFriday = sortedFriday[1];

  // তারিখ ফরম্যাট করা
  const formatBanglaDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${convertToBanglaNumbers(day)}/${convertToBanglaNumbers(month)}`;
  };

  // মোট কাউন্ট 계산
  const getTotalCount = (fridayData) => {
    if (!fridayData || !fridayData.count) return 0;
    return Object.values(fridayData.count).reduce((sum, count) => sum + count, 0);
  };

  const lastFridayTotal = getTotalCount(lastFriday);
  const previousFridayTotal = getTotalCount(previousFriday);

  // উন্নতি/অবনতি চেক
  const isImproved = previousFriday ? lastFridayTotal >= previousFridayTotal : true;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/pages/friday-amol")}
    >
      <Ionicons 
        name={isImproved ? "arrow-up-circle" : "arrow-down-circle"} 
        size={30} 
        color={isImproved ? "#037764" : "#f50828ff"} 
      />
      
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={styles.title}>জুমার আমল পরিসংখ্যান</Text>
        
        {lastFriday && (
          <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
            শেষ জুমা ({formatBanglaDate(lastFriday.date)}): {convertToBanglaNumbers(lastFridayTotal)} বার
          </Text>
        )}
        
        {previousFriday && (
          <Text style={{ fontFamily: "bangla_regular", fontSize: 12, color: "gray" }}>
            আগের জুমা ({formatBanglaDate(previousFriday.date)}): {convertToBanglaNumbers(previousFridayTotal)} বার
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
    marginBottom: 6,
  },
  countText: {
    fontFamily: "bangla_medium",
    fontSize: 12,
    color: "#2d3748",
    marginBottom: 2,
  },
});