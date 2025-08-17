import {
  AntDesign,
  Feather,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import getAddressString from "../../utils/getAddressString";

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const PROFILE_FILE = `${FileSystem.documentDirectory}app_dir/user_data.json`;

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(PROFILE_FILE);
        if (!fileInfo.exists) {
          throw new Error("প্রোফাইল ডাটা পাওয়া যায়নি");
        }

        const fileContents = await FileSystem.readAsStringAsync(PROFILE_FILE);
        const data = JSON.parse(fileContents);
        setProfileData(data);
      } catch (err) {
        console.error("প্রোফাইল ডাটা লোড করতে সমস্যা:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "সেট করা হয়নি";
    const date = new Date(dateString);
    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#037764" />
        <Text style={styles.loadingText}>ডাটা লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#d32f2f" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/pages/intro/ask_age")}
        >
          <Text style={styles.retryButtonText}>প্রোফাইল সেটআপ করুন</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* প্রোফাইল হেডার */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={40} color="#037764" />
          </View>
          <Text style={styles.userName}>{profileData?.name || "ব্যবহারকারী"}</Text>
          <Text style={styles.userSince}>
            সদস্য {formatDate(profileData?.createdAt)} থেকে
          </Text>
        </View>

        {/* ব্যক্তিগত তথ্য সেকশন */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ব্যক্তিগত তথ্য</Text>

          <TouchableOpacity style={styles.infoCard} onPress={() => router.push("/pages/intro/ask_age")}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#037764" />
              <Text style={styles.infoLabel}>নাম:</Text>
              <Text style={styles.infoValue}>
                {profileData?.name || "সেট করা হয়নি"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="calendar" size={20} color="#037764" />
              <Text style={styles.infoLabel}>বয়স:</Text>
              <Text style={styles.infoValue}>
                {profileData?.age || "সেট করা হয়নি"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="cake" size={20} color="#037764" />
              <Text style={styles.infoLabel}>জন্ম তারিখ:</Text>
              <Text style={styles.infoValue}>
                {formatDate(profileData?.birthDate)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* নামাজের বছর সেটিংস সেকশন */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>নামাজের বছর সেটিংস</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/pages/intro/ask_prayer_year")}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="calculate" size={20} color="#037764" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>নামাজ পড়ছেন:</Text>
              <Text style={styles.valueText}>
                {profileData?.prayerYears
                  ? `${profileData.prayerYears} বছর ধরে (আনুমানিক)`
                  : "সেট করা হয়নি"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* নামাজ সেটিংস সেকশন */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>নামাজ সেটিংস</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/pages/intro/ask_salah_calculation")}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="calculate" size={20} color="#037764" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>গণনা পদ্ধতি ও মাযহাব</Text>
              <Text numberOfLines={1} style={styles.valueText}>
                আপনার অবস্থান অনুযায়ী সঠিক সময় হিসাব করতে
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* লোকেশন সেটিংস সেকশন */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>লোকেশন সেটিংস</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/pages/intro/ask_location")}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="location-on" size={20} color="#037764" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>বর্তমান অবস্থান</Text>
              <Text numberOfLines={1} style={styles.valueText}>
                {getAddressString(profileData?.location?.address) || "সেট করা হয়নি"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ডাটা ম্যানেজমেন্ট সেকশন */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ডাটা ব্যবস্থাপনা</Text>

          <TouchableOpacity
            style={[styles.settingItem,{marginBottom : 10}]}
            onPress={() => router.push("/pages/backup")}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="backup" size={20} color="#037764" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>ব্যাকআপ</Text>
              <Text numberOfLines={1} style={styles.valueText}>
                আপনার ডাটা সংরক্ষনের জন্য ব্যাকআপ করে নিতে পারেন।
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/pages/backup/restore")}
          >
            <View style={styles.settingIcon}>
              <AntDesign name="export" size={20} color="#037764" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>রিস্টোর</Text>
              <Text numberOfLines={1} style={styles.valueText}>
                আপনার পুর্বের ডাটা ফিরিয়ে আনতে পারেন
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#037764",
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: "#037764",
    padding: 16,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontFamily: "bangla_medium",
    fontSize: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0f2f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#037764",
  },
  userName: {
    fontFamily: "bangla_bold",
    fontSize: 24,
    color: "#037764",
    marginBottom: 5,
  },
  userSince: {
    fontFamily: "bangla_regular",
    fontSize: 14,
    color: "#757575",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoLabel: {
    fontFamily: "bangla_bold",
    color: "#424242",
    marginLeft: 10,
    width: 120,
  },
  infoValue: {
    fontFamily: "bangla_regular",
    color: "#212121",
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0f2f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "bangla_bold",
    fontSize: 16,
    color: "#037764",
    marginBottom: 10,
    paddingLeft: 10,
  },
  settingItem: {
    flexDirection : 'row',
    alignContent : 'center',
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontFamily: "bangla_bold",
    color: "#424242",
    fontSize: 14,
    marginBottom: 4,
  },
  valueText: {
    fontFamily: "bangla_regular",
    fontSize: 13,
    color: "#757575",
    lineHeight: 18,
    flexShrink: 1,  // এই লাইনটি যোগ করুন
  },
});