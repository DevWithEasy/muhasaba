import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import * as Notifications from 'expo-notifications';
import { useState } from 'react';

export default function AskNotification() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAllow = async () => {
    setIsLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        router.replace('/(tabs)');
      } else {
        Alert.alert('অনুমতি দেওয়া হয়নি', 'আপনি পরে সেটিংস থেকে অনুমতি দিতে পারবেন');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="bell" size={32} color="white" />
          </View>
          <Text style={styles.title}>ইসলামিক রিমাইন্ডার সেবা</Text>
          <Text style={styles.subtitle}>
            নামাজ, হাদিস ও গুরুত্বপূর্ণ ইসলামিক স্মরণিকা পেতে নোটিফিকেশন অনুমতি দিন
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="notifications" size={24} color="#037764" />
            <Text style={styles.cardTitle}>নোটিফিকেশন সুবিধা</Text>
          </View>
          <Text style={styles.cardText}>
            • সব ওয়াক্তের নামাজের সময়ের সঠিক নোটিফিকেশন
            {"\n"}• দৈনিক হাদিস ও ইসলামিক শিক্ষা
            {"\n"}• রমজান ও বিশেষ দিনের এলার্ট
            {"\n"}• গুরুত্বপূর্ণ ইসলামিক ইভেন্টের স্মরণিকা
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={24} color="#037764" />
            <Text style={styles.cardTitle}>কেন অনুমতি দেবেন?</Text>
          </View>
          <Text style={styles.cardText}>
            • নামাজের সময় ভুলে যাওয়া থেকে বাঁচবেন
            {"\n"}• নিয়মিত ইসলামিক জ্ঞান অর্জন করতে পারবেন
            {"\n"}• বিশেষ ইবাদতের সময় সম্পর্কে সচেতন হবেন
            {"\n"}• আপনার ঈমানী জীবন হবে আরও সমৃদ্ধ
          </Text>
        </View>

        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>
            &apos;যে ব্যক্তি ভালো কাজের পথ দেখায়, সে নিজে সেই কাজ করার সমান সওয়াব পাবে&apos;
            {'\n'}(সহীহ মুসলিম)
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAllow}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'প্রসেসিং...' : 'অনুমতি দিন'}
          </Text>
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
    paddingBottom: 180,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 20,
  },
  iconContainer: {
    backgroundColor: "#037764",
    width: 50,
    height: 50,
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
    lineHeight: 26,
    color: "#495057",
  },
  quoteContainer: {
    backgroundColor: "#f1f8f6",
    borderRadius: 14,
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  quote: {
    fontFamily: "bangla_regular",
    textAlign: "center",
    color: "#037764",
    lineHeight: 26,
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
  primaryButton: {
    backgroundColor: "#037764",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#037764",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  buttonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "white",
  },
  secondaryButtonText: {
    color: "#495057",
  },
});