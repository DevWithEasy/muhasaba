import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import getLocalDateString from "../../../utils/getLocalDateString";

export default function AskAge() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [age, setAge] = useState(null);
  const [name, setName] = useState("");
  const [user,setUser] = useState({})

  // Load saved user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const appDir = `${FileSystem.documentDirectory}app_dir`;
        const fileUri = `${appDir}/user_data.json`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists) {
          const fileContent = await FileSystem.readAsStringAsync(fileUri);
          const userData = JSON.parse(fileContent);

          setUser(userData)
          
          setName(userData.name || "");
          if (userData.birthDate) {
            const parsedDate = new Date(userData.birthDate);
            setDate(parsedDate);
            calculateAge(parsedDate);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const calculateAge = (birthDate) => {
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    setAge(years);
    return years;
  };

  const onChange = async (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      calculateAge(selectedDate);
    }
  };

  const saveUserData = async () => {
    try {
      // Create app directory if it doesn't exist
      const appDir = `${FileSystem.documentDirectory}app_dir`;
      const dirInfo = await FileSystem.getInfoAsync(appDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      }

      // Prepare user data
      const userData = {
        ...user,
        name : name,
        birthDate: date.toISOString(),
        age,
        createdAt: params.init === 'no' ? user?.createdAt : getLocalDateString(),
      };

      // Save to JSON file
      await FileSystem.writeAsStringAsync(
        `${appDir}/user_data.json`,
        JSON.stringify(userData)
      );

      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert("দুঃখিত", "আপনার নাম লিখুন");
      return;
    }
    if (age === null) {
      Alert.alert("দুঃখিত", "আপনার জন্ম তারিখ সিলেক্ট করুন");
      return;
    }

    try {
      await saveUserData();
      if (params.init === "no") {
        router.replace("/(tabs)/user");
      } else {
        router.push({
          pathname: "/pages/intro/ask_prayer_year",
          params: { age: age.toString(), name },
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("ত্রুটি", "ডাটা সংরক্ষণ করতে সমস্যা হয়েছে");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>আপনার তথ্য প্রদান করুন</Text>
            <Text style={styles.subtitle}>
              সঠিক তথ্য প্রদান করলে সঠিক ফলাফল পাবেন
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>আপনার নাম</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#037764"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="আপনার নাম লিখুন"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>আপনার জন্ম তারিখ</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowPicker(true)}
              >
                <View style={styles.dateContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#037764"
                    style={styles.icon}
                  />
                  <Text style={styles.dateText}>
                    {date.toLocaleDateString("en-GB")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChange}
                maximumDate={new Date()}
              />
            )}

            {age !== null && (
              <View style={styles.ageContainer}>
                <Text style={styles.ageText}>
                  আপনার বর্তমান বয়স:{" "}
                  <Text style={styles.ageHighlight}>{age} বছর</Text>
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            (age === null || !name.trim()) && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={age === null || !name.trim()}
        >
          <Text style={styles.buttonText}>এগিয়ে যান</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
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
    padding: 25,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontFamily: "bangla_bold",
    fontSize: 24,
    color: "#037764",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "bangla_medium",
    fontSize: 15,
    color: "#334155",
    marginBottom: 8,
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
    elevation: 1,
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
  datePickerButton: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  dateText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#0f172a",
  },
  ageContainer: {
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginTop: 10,
  },
  ageText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#166534",
    textAlign: "center",
  },
  ageHighlight: {
    fontFamily: "bangla_bold",
    color: "#047857",
    fontSize: 18,
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
    elevation: 2,
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
});
