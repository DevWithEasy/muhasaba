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
    const loadUserData = async () => {
      try {
        const appDir = `${FileSystem.documentDirectory}app_dir`;
        const fileUri = `${appDir}/user_data.json`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists) {
          const fileContent = await FileSystem.readAsStringAsync(fileUri);
          const userData = JSON.parse(fileContent);
          const parsedAge = parseInt(userData.age);
          setAge(parsedAge);
          setPrayerAge(Math.max(0, parsedAge - 15));
          setPrayerYears(userData.prayerYears);
        } else {
          if (params.age) {
            const parsedAge = parseInt(params.age);
            if (!isNaN(parsedAge)) {
              setAge(parsedAge);
              setPrayerAge(Math.max(0, parsedAge - 15));
            } else {
              Alert.alert("ত্রুটি", "বয়স সঠিকভাবে লোড হয়নি");
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
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
                if (params.init === "no") {
                  router.replace("/(tabs)/user");
                } else {
                  router.push("/pages/intro/ask_location");
                }
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
      if (params.init === "no") {
        router.replace("/(tabs)/user");
      } else {
        router.push("/pages/intro/ask_location");
      }
    } catch (error) {
      console.error("Error saving prayer data:", error);
      Alert.alert("ত্রুটি", "ডেটা সংরক্ষণ করতে সমস্যা হয়েছে");
    }
  };
  console.log(params.init);
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
                <Text style={styles.infoTitle}>
                  ইসলামিক বিধান সম্পর্কে জানুন
                </Text>

                <View style={styles.infoItem}>
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color="#166534"
                  />
                  <Text style={styles.infoText}>
                    ইসলামিক শরীয়ত অনুযায়ী নামাজ ফরজ হয় বালেগ হওয়ার পর থেকে
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="time" size={18} color="#166534" />
                  <Text style={styles.infoText}>
                    ছেলেদের জন্য: স্বপ্নদোষ অথবা ১৫ বছর পূর্ণ হওয়া
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="time" size={18} color="#166534" />
                  <Text style={styles.infoText}>
                    মেয়েদের জন্য: হায়েজ (মাসিক) শুরু অথবা ১৫ বছর পূর্ণ হওয়া
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="book" size={18} color="#166534" />
                  <Text style={styles.infoText}>
                    &quot;সাত বছর বয়সে তোমরা তোমাদের সন্তানকে নামাজ পড়তে বলবে,
                    আর দশ বছর বয়সে পড়তে না চাইলে শাস্তি দেবে।&quot; (আবু দাউদ,
                    তিরমিজি){"\n"}অর্থাৎ, ৭ বছর থেকে অভ্যাস করানো এবং ১০ বছর
                    থেকে কঠোরভাবে নিয়মিত নামাজ পড়তে বাধ্য করা — যাতে বালেগ
                    হওয়ার পর নামাজ বাদ না পড়ে।
                  </Text>
                </View>

                <View style={styles.highlightSection}>
                  <Text style={styles.highlightText}>
                    আপনার বর্তমান বয়স: {age.toLocaleString("bn-BD")} বছর
                  </Text>
                  <Text style={styles.highlightText}>
                    নামাজ ফরজ হওয়ার বয়স: ১৫ বছর
                  </Text>
                  <Text style={styles.highlightText}>
                    আপনার নামাজ পড়ার বয়স: {prayerAge.toLocaleString("bn-BD")}{" "}
                    বছর
                  </Text>
                  <Text style={styles.smallText}>
                    (হিসাব করা হয়েছে: {today.toLocaleDateString("bn-BD")}{" "}
                    পর্যন্ত)
                  </Text>
                </View>
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

              {prayerAge <= 0 && (
                <View style={styles.warningCard}>
                  <Ionicons name="warning" size={24} color="#b45309" />
                  <Text style={styles.warningText}>
                    আপনার বয়স ১৫ বছরের কম হওয়ায় নামাজ এখনো আপনার উপর ফরজ
                    হয়নি। তবে নামাজের অভ্যাস গড়ে তুলতে পারেন।
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
    padding: 15,
    paddingBottom: 100,
  },
  title: {
    fontFamily: "bangla_bold",
    fontSize: 24,
    color: "#037764",
    textAlign: "center",
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: "#f0fdf4",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 30,
  },
  infoTitle: {
    fontFamily: "bangla_bold",
    fontSize: 18,
    color: "#166534",
    textAlign: "center",
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoText: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    color: "#166534",
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  highlightSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#bbf7d0",
  },
  highlightText: {
    fontFamily: "bangla_bold",
    fontSize: 15,
    color: "#047857",
    textAlign: "center",
    marginVertical: 5,
  },
  smallText: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#4d7c0f",
    textAlign: "center",
    marginTop: 5,
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
  warningCard: {
    backgroundColor: "#fffbeb",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fcd34d",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  warningText: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    color: "#b45309",
    marginLeft: 10,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "bangla_medium",
    fontSize: 15,
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
    elevation: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  input: {
    flex: 1,
    fontFamily: "bangla_regular",
    fontSize: 15,
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
    fontSize: 16,
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
