import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter()

  const PROFILE_FILE = `${FileSystem.documentDirectory}app_dir/user_data.json`;

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Check if file exists first
        const fileInfo = await FileSystem.getInfoAsync(PROFILE_FILE);

        if (!fileInfo.exists) {
          throw new Error("Profile file does not exist");
        }

        // Read the file
        const fileContents = await FileSystem.readAsStringAsync(PROFILE_FILE);
        const data = JSON.parse(fileContents);

        setProfileData(data);
      } catch (err) {
        console.error("Error loading profile data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error: {error}</Text>
      </View>
    );
  }
  // console.log(profileData)
  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: "#f8fafc" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Profile</Text>

      {profileData ? (
        <View>
          <Text>Name: {profileData.name || "Not set"}</Text>
          <TouchableOpacity onPress={()=>router.push('/pages/intro/ask_location')}>
            <Text>Location</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>router.push('/pages/backup/')}>
            <Text>Backup</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>No profile data found</Text>
      )}
    </View>
  );
}
