import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
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
import getAddressString from "../../../utils/getAddressString";

export default function AskLocation() {
  const router = useRouter();
  const [locationLoading, setLocationLoading] = useState(false);
  const [continueLoading, setContinueLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState({
    city: "",
    district: "",
    subregion: "",
    region: "",
    country: "",
  });
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const appDir = `${FileSystem.documentDirectory}app_dir`;
        const fileUri = `${appDir}/user_data.json`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists) {
          const fileContent = await FileSystem.readAsStringAsync(fileUri);
          const userData = JSON.parse(fileContent);
          if(userData.location){
            setLocation({
              latitude : userData.location.latitude,
              longitude : userData.location.longitude
            })
            setAddress(userData.location.address)
          }
          
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData()
  });

  const getLocationPermission = async () => {
    setLocationLoading(true);
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
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

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
      setLocationLoading(false);
    }
  };

  const saveLocationData = async (locationData) => {
    try {
      const appDir = `${FileSystem.documentDirectory}app_dir`;
      const filePath = `${appDir}/user_data.json`;

      const dirInfo = await FileSystem.getInfoAsync(appDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      }

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      let userData = {};

      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        userData = JSON.parse(fileContent);
      }

      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify({ ...userData, location: locationData }, null, 2)
      );
    } catch (error) {
      console.error("Error saving location:", error);
      throw error;
    }
  };

  const handleContinue = async () => {
    if (!location) {
      Alert.alert(
        "অবস্থান প্রয়োজন",
        "চালিয়ে যেতে দয়া করে অবস্থান চালু করুন"
      );
      return;
    }

    setContinueLoading(true);
    try {
      router.push("/pages/intro/ask_salah_calculation");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "ত্রুটি",
        "পরবর্তী পৃষ্ঠায় যেতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।"
      );
    } finally {
      setContinueLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="location-on" size={40} color="white" />
          </View>
          <Text style={styles.title}>অবস্থান সেটিংস</Text>
          <Text style={styles.subtitle}>
            সঠিক নামাজের সময় জানতে আপনার অবস্থান নির্ধারণ করুন
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#037764" />
            <Text style={styles.cardTitle}>কেন প্রয়োজন?</Text>
          </View>
          <Text style={styles.cardText}>
            • নামাজের সময় সঠিকভাবে গণনা করতে
            {"\n"}• আপনার নিকটতম মসজিদ খুঁজে পেতে
            {"\n"}• স্থানীয় ইসলামিক ইভেন্ট সম্পর্কে জানতে
          </Text>
        </View>

        {location && (
          <View style={styles.locationCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="place" size={24} color="#037764" />
              <Text style={styles.cardTitle}>আপনার বর্তমান অবস্থান</Text>
            </View>
            <Text style={styles.locationText}>{getAddressString(address)}</Text>
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinateText}>
                অক্ষাংশ: {location.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordinateText}>
                দ্রাঘিমাংশ: {location.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        )}

        {permissionDenied && (
          <View style={styles.warningCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="warning" size={24} color="#d32f2f" />
              <Text style={styles.warningTitle}>অনুমতি প্রয়োজন</Text>
            </View>
            <Text style={styles.warningText}>
              আপনি অবস্থান অনুমতি দেননি। সেটিংস থেকে এটি পরিবর্তন করতে পারেন।
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.locationButton,
            locationLoading && styles.buttonDisabled,
          ]}
          onPress={getLocationPermission}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="my-location" size={20} color="white" />
              <Text style={styles.buttonText}>
                {location ? "অবস্থান আপডেট করুন" : "অবস্থান নির্ধারণ করুন"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, !location && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!location || continueLoading}
        >
          <Text style={styles.buttonText}>এগিয়ে যান</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    padding: 10,
    paddingBottom: 120,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconCircle: {
    backgroundColor: "#037764",
    width: 60,
    height: 60,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#037764",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontFamily: "bangla_bold",
    fontSize: 20,
    color: "#037764",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "bangla_regular",
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "90%",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    borderLeftWidth: 2,
    borderLeftColor: "#037764",
  },
  locationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    borderLeftWidth: 2,
    borderLeftColor: "#037764",
  },
  warningCard: {
    backgroundColor: "#fff3f3",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 2,
    borderLeftColor: "#f44336",
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
  warningTitle: {
    fontFamily: "bangla_bold",
    fontSize: 18,
    color: "#d32f2f",
    marginLeft: 10,
  },
  cardText: {
    fontFamily: "bangla_regular",
    lineHeight: 24,
    color: "#495057",
  },
  locationText: {
    fontFamily: "bangla_medium",
    lineHeight: 24,
    color: "#2e7d32",
    marginBottom: 10,
  },
  coordinatesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  coordinateText: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    color: "#616161",
    marginVertical: 2,
  },
  warningText: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    lineHeight: 22,
    color: "#d32f2f",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButton: {
    backgroundColor: "#0288d1",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#0288d1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButton: {
    backgroundColor: "#037764",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#037764",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "white",
    marginHorizontal: 8,
  },
});
