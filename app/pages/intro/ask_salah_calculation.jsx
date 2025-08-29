import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const calculationMethods = [
  { id: 0, name: "শিয়া ইথনা-আনসারি" },
  { id: 1, name: "করাচি ইসলামিক বিজ্ঞান বিশ্ববিদ্যালয়" },
  { id: 2, name: "ইসলামিক সোসাইটি অফ নর্থ আমেরিকা (ISNA)" },
  { id: 3, name: "মুসলিম ওয়ার্ল্ড লীগ (MWL)" },
  { id: 4, name: "উম্মুল কুরা, মক্কা" },
  { id: 5, name: "মিশরীয় জেনারেল অথরিটি" },
  { id: 7, name: "ইনস্টিটিউট অফ জিওফিজিক্স, তেহরান" },
  { id: 8, name: "উপসাগরীয় অঞ্চল" },
  { id: 9, name: "কুয়েত" },
  { id: 10, name: "কাতার" },
  { id: 11, name: "মজলিস উগামা ইসলাম সিঙ্গাপুর" },
  { id: 12, name: "ইউনিয়ন অর্গানাইজেশন ইসলামিক ডি ফ্রান্স" },
  { id: 13, name: "দিয়ানেট ইসলেরি বাসকানলিগি" },
  { id: 14, name: "রাশিয়ার আধ্যাত্মিক প্রশাসন" },
  { id: 15, name: "মুনসাইটিং কমিটি" },
];

const asrSchools = [
  { id: 0, name: "শাফেই/মালেকি/হাম্বলি" },
  { id: 1, name: "হানাফি" },
];

export default function AskSalahCalculation() {
  const router = useRouter();
  const [method, setMethod] = useState(1);
  const [school, setSchool] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const loadUserData = async () => {
      try {
        const appDir = `${FileSystem.documentDirectory}app_dir`;
        const fileUri = `${appDir}/user_data.json`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists) {
          const fileContent = await FileSystem.readAsStringAsync(fileUri);
          const userData = JSON.parse(fileContent);
          if (userData.location) {
            setMethod(userData?.claculation?.method ? userData.claculation.method : 1);
            setSchool(userData?.claculation?.school ? userData.claculation.school : 1);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const savePreference = async () => {
    try {
      // Define the file path
      const appDir = `${FileSystem.documentDirectory}app_dir`;
      const filePath = `${appDir}/user_data.json`;

      // Check if directory exists, create if not
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

      // Update the specific key with new value
      const updateData = {
        ...userData,
        claculation: {
          method,
          school,
        },
      };
      // Write the updated data back to file
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(updateData, null, 2)
      );
    } catch (error) {
      console.error("Error saving preference:", error);
      throw error;
    }
  };

  const handleMethodChange = (value) => {
    setMethod(value);
  };

  const handleSchoolChange = (value) => {
    setSchool(value);
  };

  const createSalahDataFile = async () => {
    try {
      const appDir = `${FileSystem.documentDirectory}app_dir`;
      const dirInfo = await FileSystem.getInfoAsync(appDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      }

      [
        "salah_data.json",
        "quran_data.json",
        "hadith_data.json",
        "darood_data.json",
        "istighfar_data.json",
        "tasbih_data.json",
        "friday_data.json",
        "good_bad_job_data.json",
        "donation_data.json",
        "todo_data.json",
      ].forEach(async (name) => {
        await FileSystem.writeAsStringAsync(
          `${appDir}/${name}`,
          JSON.stringify([])
        );
      });
    } catch (error) {
      console.error("Error creating salah data file:", error);
      throw error;
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      await savePreference();
      await createSalahDataFile();
      await AsyncStorage.setItem("is-first-install", "1");
      router.push("/pages/intro/ask_notification");
    } catch (error) {
      Alert.alert(
        "ত্রুটি",
        "অ্যাপ ডেটা ইনিশিয়ালাইজ করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।"
      );
      console.error("Initialization error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#037764" />
        <Text style={styles.loadingText}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>নামাজের হিসাব পদ্ধতি</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              আপনার এলাকার জন্য উপযুক্ত নামাজের সময় গণনা পদ্ধতি নির্বাচন করুন
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>গণনা পদ্ধতি:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={method}
                onValueChange={handleMethodChange}
                dropdownIconColor="#037764"
                style={styles.picker}
              >
                {calculationMethods.map((item) => (
                  <Picker.Item
                    key={item.id}
                    label={item.name}
                    value={item.id}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>আসরের গণনা পদ্ধতি:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={school}
                onValueChange={handleSchoolChange}
                dropdownIconColor="#037764"
                style={styles.picker}
              >
                {asrSchools.map((item) => (
                  <Picker.Item
                    key={item.id}
                    label={item.name}
                    value={item.id}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.selectionCard}>
            <Text style={styles.highlightText}>নির্বাচিত পদ্ধতি:</Text>
            <Text style={styles.selectedMethod}>
              {calculationMethods.find((m) => m.id === method).name}
            </Text>
            <Text style={styles.selectedMethod}>
              {asrSchools.find((s) => s.id === school).name}
            </Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>এগিয়ে যান</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>
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
    paddingTop: 40,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#037764",
    marginTop: 15,
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
  infoText: {
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#166534",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#334155",
    marginBottom: 10,
    marginLeft: 5,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: "hidden",
  },
  picker: {
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#0f172a",
  },
  pickerItem: {
    fontFamily: "bangla_regular",
    fontSize: 16,
  },
  selectionCard: {
    backgroundColor: "#ecfdf5",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    marginTop: 20,
  },
  highlightText: {
    fontFamily: "bangla_bold",
    fontSize: 16,
    color: "#047857",
    textAlign: "center",
    marginBottom: 10,
  },
  selectedMethod: {
    fontFamily: "bangla_regular",
    color: "#065f46",
    textAlign: "center",
    marginVertical: 5,
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "white",
    marginRight: 10,
  },
});
