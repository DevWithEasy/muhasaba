import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function Muhasaba() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>মুহাসাবা কি?</Text>

        <View style={styles.card}>
          <Text style={styles.quoteText}>
            ইসলামে আত্মসমালোচনাকে মুহাসাবা (মুহাসাবাহ) বলা হয়। এটি ইসলামের একটি
            গুরুত্বপূর্ণ ধারণা। মুহাসাবা অর্থ হলো নিজের হিসাব নেওয়া বা
            আত্ম-পর্যবেক্ষণ করা। এটি মূলত নিজের ভালো-মন্দ কাজ, ইচ্ছা, এবং
            চিন্তাভাবনাগুলো পর্যালোচনা করার একটি প্রক্রিয়া।
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.quoteText}>
            মুহাসাবা একজন মুসলিমের মধ্যে আল্লাহ-ভীতি (তাকওয়া) বৃদ্ধি করতে
            সাহায্য করে। যখন একজন ব্যক্তি প্রতিনিয়ত তার নিজের কাজগুলো
            পর্যালোচনা করে, তখন সে আল্লাহর প্রতি আরও বেশি সচেতন হয় এবং তার
            আদেশগুলো মেনে চলার চেষ্টা করে।
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.quoteText}>
            সংক্ষেপে, আত্মসমালোচনা বা মুহাসাবা হলো ইসলামের এমন একটি ধারণা, যা
            একজন ব্যক্তিকে তার জীবন, উদ্দেশ্য, এবং দায়িত্ব সম্পর্কে সচেতন থাকতে
            সাহায্য করে। এটি একজন মুসলিমের ব্যক্তিগত ও আধ্যাত্মিক উন্নতির জন্য
            অপরিহার্য।
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.quoteText}>
            রাসুলুল্লাহ (সা.) বলেন, &quot;বুদ্ধিমান সেই ব্যক্তি, যে তার নফসের (আত্মার) হিসাব নেয় এবং মৃত্যুর পরবর্তী জীবনের জন্য কাজ করে; আর দুর্বল ঐ ব্যক্তি, যে নিজের নফসের কুপ্রবৃত্তির অনুসরণ করে এবং আল্লাহর কাছেও আশা-আকাঙ্ক্ষা রাখে।&quot;
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.quoteText}>
            অনন্তর যে অবাধ্য হবে এবং দুনিয়ার জীবনকে প্রাধান্য দিবে তার ঠিকানা
            হবে জাহান্নাম। আর যে তার প্রভুর সামনে দাঁড়ানোর ভয় করবে এবং মনকে
            প্রবৃত্তি বা খেয়াল-খুশীর অনুসরণ থেকে বিরত রাখবে তার ঠিকানা হবে
            জান্নাত। (নাযিয়াত ৩৭-৪১)।
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.quoteText}>
            বুদ্ধিমান সেই ব্যক্তি, যে তার নফসের হিসাব নেয় এবং মৃত্যুর পরবর্তী
            জীবনের জন্য কাজ করে; আর দুর্বল ঐ ব্যক্তি, যে নিজের নফসের
            কুপ্রবৃত্তির অনুসরণ করে এবং আল্লাহর কাছেও আশা-আকাঙ্খা রাখে। –(হাদিস
            নং- ২৪৫৯)।
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/pages/intro/ask_must_read")}
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
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    paddingTop: 60,
  },
  title: {
    fontFamily: "bangla_bold",
    fontSize: 28,
    color: "#037764",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1.5,
  },
  text: {
    fontFamily: "bangla_regular",
    fontSize: 16,
    lineHeight: 28,
    color: "#333",
  },
  quoteText: {
    fontFamily: "bangla_regular",
    fontSize: 15,
    lineHeight: 26,
    color: "#555",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#037764",
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "white",
    marginRight: 10,
  },
});
