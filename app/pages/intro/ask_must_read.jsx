import { FontAwesome5, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AskMustRead() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="book-reader" size={40} color="white" />
          </View>
          <Text style={styles.title}>প্রয়োজনীয় নির্দেশিকা</Text>
          <Text style={styles.subtitle}>
            অ্যাপটি ব্যবহার শুরু করার আগে এই তথ্যগুলো মনোযোগ দিয়ে পড়ুন
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={24} color="#037764" />
            <Text style={styles.cardTitle}>গুরুত্বপূর্ণ তথ্য</Text>
          </View>
          <Text style={styles.cardText}>
            • এই অ্যাপটি আপনার দৈনন্দিন ইবাদত, মুহাসাবা এবং আত্মউন্নয়নের জন্য
            একটি সহায়ক টুল
            {"\n"}• সর্বোচ্চ সুফল পেতে নিয়মিত ব্যবহার করুন
            {"\n"}• আপনার ডাটা সম্পূর্ণ গোপনীয় এবং শুধুমাত্র আপনার ডিভাইসে
            সংরক্ষিত হয়
            {"\n"}• সত্যিকারের উন্নতির জন্য সব তথ্য সঠিকভাবে লিপিবদ্ধ করুন
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="star" size={24} color="#037764" />
            <Text style={styles.cardTitle}>সেরা ব্যবহারের উপায়</Text>
          </View>
          <Text style={styles.cardText}>
            • প্রতিদিন সকালে বা রাতে নির্দিষ্ট সময় বের করে মুহাসাবা করুন
            {"\n"}• প্রতিটি ইবাদতের পর তাৎক্ষণিকভাবে আপডেট করুন
            {"\n"}• সাপ্তাহিক ও মাসিক রিপোর্ট দেখে আপনার উন্নতি বিশ্লেষণ করুন
            {"\n"}• লক্ষ্য নির্ধারণ করে তা অর্জনের চেষ্টা করুন
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <AntDesign name="bulb1" size={24} color="#037764" />
            <Text style={styles.cardTitle}>উপদেশ ও পরামর্শ</Text>
          </View>
          <Text style={styles.cardText}>
            • ছোট ছোট লক্ষ্য নির্ধারণ করে এগিয়ে যান
            {"\n"}• প্রতিদিনের অগ্রগতি নিয়ে সন্তুষ্ট থাকুন
            {"\n"}• ব্যর্থ হলে হতাশ না হয়ে পুনরায় চেষ্টা করুন
            {"\n"}• নিয়মিত কুরআন ও হাদিস অধ্যয়নের অভ্যাস গড়ে তুলুন
            {"\n"}• পরিবার ও বন্ধুদের সাথে ভালো কাজে প্রতিযোগিতা করুন
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="warning" size={24} color="#037764" />
            <Text style={styles.cardTitle}>সতর্কতা</Text>
          </View>
          <Text style={styles.cardText}>
            • অ্যাপটি শুধুমাত্র সহায়ক টুল, ইবাদতের নিয়ত শুদ্ধ রাখুন
            {"\n"}• সংখ্যার চেয়ে ইবাদতের মানের দিকে বেশি নজর দিন
            {"\n"}• অহংকার বা রিয়া থেকে বেঁচে থাকুন
            {"\n"}• নিয়মিত ব্যাকআপ নিন যাতে ডাটা হারিয়ে না যায়
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="privacy-tip" size={24} color="#037764" />
            <Text style={styles.cardTitle}>গোপনীয়তা নীতি</Text>
          </View>
          <Text style={styles.cardText}>
            • আপনার সমস্ত ডাটা শুধুমাত্র আপনার ডিভাইসে সংরক্ষিত হয়
            {"\n"}• আমরা কোনো ব্যক্তিগত তথ্য সংগ্রহ বা শেয়ার করি না
            {"\n"}• ব্যাকআপ নেওয়ার মাধ্যমে আপনার ডাটা সুরক্ষিত রাখুন
            {"\n"}• ডিভাইস পরিবর্তনের আগে অবশ্যই ব্যাকআপ নিন
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/pages/intro/ask_age")}
        >
          <Text style={styles.buttonText}>এগিয়ে যান</Text>
          <MaterialIcons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 20,
  },
  iconContainer: {
    backgroundColor: "#037764",
    width: 60,
    height: 60,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#037764",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontFamily: "bangla_bold",
    fontSize: 22,
    color: "#037764",
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: "bangla_regular",
    color: "#6c757d",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
    maxWidth: "90%",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
    borderLeftWidth: 2,
    borderLeftColor: "#037764",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "bangla_bold",
    fontSize: 16,
    color: "#037764",
    marginLeft: 10,
  },
  cardText: {
    fontFamily: "bangla_regular",
    fontSize: 15,
    lineHeight: 26,
    color: "#495057",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#037764",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#037764",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "white",
    marginRight: 10,
  },
});
