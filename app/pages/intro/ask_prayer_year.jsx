import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AskPrayerYear() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [prayerYears, setPrayerYears] = useState("");
  const [age, setAge] = useState(0);
  const [prayerAge, setPrayerAge] = useState(0);
  const today = new Date();

  useEffect(() => {
    if (params.age) {
      const parsedAge = parseInt(params.age);
      if (!isNaN(parsedAge)) {
        setAge(parsedAge);
        setPrayerAge(Math.max(0, parsedAge - 7));
      } else {
        Alert.alert("ত্রুটি", "বয়স সঠিকভাবে লোড হয়নি");
      }
    }
  }, [params.age]);

  const savePrayerData = async () => {
    try {
      const appDir = `${FileSystem.documentDirectory}app_dir`;
      const filePath = `${appDir}/user_data.json`;

      // Create directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(appDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      let userData = {};

      // If file exists, read current data
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        userData = JSON.parse(fileContent);
      }

      // Update prayer data
      userData = {
        ...userData,
        prayerYears: prayerYears,
        lastUpdated: today.toISOString(),
      };

      // Save back to file
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(userData, null, 2)
      );

      console.log("Prayer data saved successfully");
    } catch (error) {
      console.error("Error saving prayer data:", error);
      throw error;
    }
  };

  const handleContinue = async () => {
    if (prayerYears === "") {
      Alert.alert("দুঃখিত", "আপনি কত বছর নামাজ পড়েছেন তা লিখুন");
      return;
    }

    const years = parseInt(prayerYears);
    if (isNaN(years)) {
      Alert.alert("ভুল ইনপুট", "সঠিক সংখ্যা লিখুন");
      return;
    }

    if (years > prayerAge) {
      Alert.alert(
        "সতর্কতা",
        `আপনার নামাজ পড়ার বয়স ${prayerAge} বছর, কিন্তু আপনি ${years} বছর লিখেছেন। আপনি কি নিশ্চিত?`,
        [
          { text: "না", style: "cancel" },
          {
            text: "হ্যাঁ",
            onPress: async () => {
              try {
                await savePrayerData();
                router.push("/pages/intro/ask_location");
              } catch (error) {
                console.error("Error saving prayer data:", error);
                Alert.alert("ত্রুটি", "ডেটা সংরক্ষণ করতে সমস্যা হয়েছে");
              }
            },
          },
        ]
      );
      return;
    }

    try {
      await savePrayerData();
      router.push("/pages/intro/ask_location");
    } catch (error) {
      console.error("Error saving prayer data:", error);
      Alert.alert("ত্রুটি", "ডেটা সংরক্ষণ করতে সমস্যা হয়েছে");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>নামাজের তথ্য</Text>

          {age === 0 ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>
                আপনার বয়স সঠিকভাবে লোড হয়নি। দয়া করে পূর্বের পৃষ্ঠায় ফিরে যান
              </Text>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>
                  পূর্বের পৃষ্ঠায় ফিরে যান
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  ইসলামিক বিধান অনুযায়ী ৭ বছর বয়স থেকে নামাজ ফরজ হয়
                </Text>
                <Text style={styles.highlightText}>
                  আপনার বর্তমান বয়স: {age} বছর
                </Text>
                <Text style={styles.highlightText}>
                  আপনার নামাজ পড়ার বয়স: {prayerAge} বছর
                </Text>
                <Text style={styles.smallText}>
                  (হিসাব করা হয়েছে: {today.toLocaleDateString("bn-BD")}{" "}
                  পর্যন্ত)
                </Text>
              </View>

              {prayerAge > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    আপনি আনুমানিক কত বছর নামাজ পড়েছেন?
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color="#037764"
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={prayerYears}
                      onChangeText={setPrayerYears}
                      placeholder="বছর লিখুন"
                      placeholderTextColor="#999"
                      maxLength={3}
                    />
                  </View>
                  <Text style={styles.noteText}>
                    সর্বোচ্চ {prayerAge} বছর পর্যন্ত লিখতে পারবেন
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>

      {age > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button,
              !prayerYears && prayerAge > 0 && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!prayerYears && prayerAge > 0}
          >
            <Text style={styles.buttonText}>
              {prayerAge > 0 ? "এগিয়ে যান" : "প্রধান মেনুতে যান"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 30,
  },
  mainContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 25,
    paddingTop: 40,
    paddingBottom: 100,
  },
  title: {
    fontFamily: "bangla_bold",
    fontSize: 24,
    color: "#037764",
    textAlign: "center",
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: "#f0fdf4",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 30,
  },
  errorCard: {
    backgroundColor: "#fee2e2",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 30,
    alignItems: "center",
  },
  errorText: {
    fontFamily: "bangla_medium",
    fontSize: 18,
    color: "#b91c1c",
    textAlign: "center",
    marginBottom: 15,
  },
  infoText: {
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#166534",
    marginBottom: 10,
    textAlign: "center",
  },
  highlightText: {
    fontFamily: "bangla_bold",
    fontSize: 18,
    color: "#047857",
    textAlign: "center",
    marginVertical: 10,
  },
  smallText: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    color: "#4d7c0f",
    textAlign: "center",
    marginTop: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#334155",
    marginBottom: 10,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  input: {
    flex: 1,
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#0f172a",
    paddingVertical: 15,
    paddingLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  noteText: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    color: "#64748b",
    marginTop: 5,
    textAlign: "right",
  },
  footer: {
    padding: 25,
    paddingBottom: 30,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  button: {
    backgroundColor: "#037764",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: "#bdbdbd",
  },
  buttonText: {
    fontFamily: "bangla_medium",
    fontSize: 18,
    color: "white",
    marginRight: 10,
  },
  backButton: {
    backgroundColor: "#047857",
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "white",
  },
});
