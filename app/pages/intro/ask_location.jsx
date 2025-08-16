import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import getAddressString from "../../../utils/getAddressString";

export default function AskLocation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState({
    city: "",
    district: "",
    subregion: "",
    region: "",
    country: "",
  });
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getLocationPermission = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setPermissionDenied(true);
        Alert.alert(
          "অনুমতি প্রত্যাখ্যান",
          "সঠিক নামাজের সময়ের জন্য অবস্থান অনুমতি প্রয়োজন",
          [{ text: "ঠিক আছে" }]
        );
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      let addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        setAddress({
          city: addr.city || "অজানা শহর",
          district: addr.district || "অজানা জেলা",
          subregion: addr.subregion || "অজানা অঞ্চল",
          region: addr.region || "অজানা অঞ্চল",
          country: addr.country || "অজানা দেশ",
        });

        await saveLocationData({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: {
            city: addr.city || "অজানা শহর",
            district: addr.district || "অজানা জেলা",
            subregion: addr.subregion || "অজানা অঞ্চল",
            region: addr.region || "অজানা অঞ্চল",
            country: addr.country || "অজানা দেশ",
          },
        });
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert(
        "ত্রুটি",
        "অবস্থান পাওয়া যায়নি। দয়া করে আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  const saveLocationData = async (locationData) => {
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
      console.log(userData)
      //save json after update
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify({ ...userData, loaction: locationData }, null, 2)
      );
      await AsyncStorage.setItem("userLocation", JSON.stringify(locationData));
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const handleContinue = async () => {
    if (location) {
      try {
        setLoading(true);
        router.push("/pages/intro/ask_salah_calculation");
      } catch (error) {
        Alert.alert(
          "ত্রুটি",
          "অ্যাপ ডেটা ইনিশিয়ালাইজ করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।"
        );
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert(
        "অবস্থান প্রয়োজন",
        "চালিয়ে যেতে দয়া করে অবস্থান চালু করুন"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="location-on" size={80} color="#037764" />
          </View>

          <Text style={styles.title}>অবস্থান অনুমতি</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              আপনার নামাজের সময় সঠিকভাবে দেখানোর জন্য, আমাদের আপনার বর্তমান
              অবস্থান জানতে হবে।
            </Text>
            <Text style={styles.smallText}>
              এই তথ্য শুধুমাত্র নামাজের সময় গণনার জন্য ব্যবহার করা হবে।
            </Text>
          </View>

          {location && (
            <>
              <View style={styles.addressCard}>
                <Text style={styles.highlightText}>আপনার অবস্থান:</Text>
                <Text style={styles.addressText}>
                  {getAddressString(address)}
                </Text>
              </View>

              <View style={styles.coordinatesCard}>
                <Text style={styles.coordinatesText}>
                  অক্ষাংশ: {location.coords.latitude.toFixed(4)}
                </Text>
                <Text style={styles.coordinatesText}>
                  দ্রাঘিমাংশ: {location.coords.longitude.toFixed(4)}
                </Text>
              </View>
            </>
          )}

          {permissionDenied && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                আপনি অবস্থান অনুমতি দেননি। সেটিংস থেকে এটি পরিবর্তন করতে পারেন।
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={getLocationPermission}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.buttonContent}>
              <MaterialIcons name="my-location" size={20} color="white" />
              <Text style={styles.buttonText}>
                {location ? "অবস্থান আপডেট করুন" : "অবস্থান অনুমতি দিন"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!location || loading) && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!location || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>এগিয়ে যান</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
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
    padding: 25,
    paddingTop: 20,
    paddingBottom: 100,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
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
    marginBottom: 25,
  },
  infoText: {
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#166534",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 24,
  },
  smallText: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    color: "#4d7c0f",
    textAlign: "center",
  },
  addressCard: {
    backgroundColor: "#ecfdf5",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    marginBottom: 15,
  },
  highlightText: {
    fontFamily: "bangla_bold",
    fontSize: 16,
    color: "#047857",
    textAlign: "center",
    marginBottom: 10,
  },
  addressText: {
    fontFamily: "bangla_regular",
    color: "#065f46",
    textAlign: "center",
  },
  coordinatesCard: {
    backgroundColor: "#f0f9ff",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bae6fd",
    marginBottom: 20,
  },
  coordinatesText: {
    fontFamily: "bangla_regular",
    fontSize: 15,
    color: "#0369a1",
    textAlign: "center",
    marginVertical: 5,
  },
  warningCard: {
    backgroundColor: "#fef2f2",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 20,
  },
  warningText: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    color: "#b91c1c",
    textAlign: "center",
  },
  footer: {
    padding: 25,
    paddingBottom: 30,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  button: {
    backgroundColor: "#0288d1",
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
    marginBottom: 15,
  },
  continueButton: {
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "white",
    marginHorizontal: 10,
  },
});
