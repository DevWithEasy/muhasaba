import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // নেটওয়ার্ক কানেকশন লিসেনার সেটআপ
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  async function checkForUpdates() {
    if (__DEV__) {
      // ডেভেলপমেন্ট মোডে আপডেট চেক করবে না
      checkFirstInstall();
      return;
    }

    // ইন্টারনেট না থাকলে আপডেট চেক স্কিপ করুন
    if (!isConnected) {
      console.log("No internet connection, skipping update check");
      checkFirstInstall();
      return;
    }

    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setShowUpdateModal(true);
        setUpdateStatus("checked");
        setUpdateText("নতুন আপডেট পাওয়া গেছে। ");

        setTimeout(async () => {
          setUpdateStatus("downloading");
          setUpdateText("আপডেট ডাউনলোড হচ্ছে...");
          
          await Updates.fetchUpdateAsync();

          setUpdateStatus("installing");
          setUpdateText("আপডেট ইনস্টল হচ্ছে...");
          await Updates.reloadAsync();
        }, 2000); 
      } else {
        checkFirstInstall();
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      checkFirstInstall();
    }
  }

  async function checkFirstInstall() {
    try {
      const isFirst = await AsyncStorage.getItem("is-first-install");
      if (isFirst === null || isFirst !== "1") {
        router.replace("/pages/intro");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error checking first install:", error);
      router.replace("/(tabs)");
    }
  }

  useEffect(() => {
    checkForUpdates();
  }, [isConnected]); // isConnected পরিবর্তন হলে আবার চেক করবে

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f8fafc",
      }}
    >
      <Text
        style={{ fontFamily: "bangla_bold", fontSize: 50, color: "#037764" }}
      >
        মুহাসাবা
      </Text>
      <Text
        style={{
          fontFamily: "bangla_medium",
          fontSize: 16,
          color: "#ff1100ff",
        }}
      >
        (আত্মসমালোচনা)
      </Text>

      {!isConnected && (
        <View
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: "#ffebee",
            borderRadius: 5,
          }}
        >
          <Text
            style={{
              fontFamily: "bangla_medium",
              color: "#d32f2f",
              textAlign: "center",
            }}
          >
            ইন্টারনেট সংযোগ নেই। আপডেট চেক করা সম্ভব হচ্ছে না।
          </Text>
        </View>
      )}

      {showUpdateModal && (
        <View
          style={{
            position: "absolute",
            bottom: 180,
            marginTop: 40,
            width: "100%",
            alignItems: "center",
            marginHorizontal: 20,
            padding: 5,
            borderRadius: 5,
          }}
        >
          {updateStatus !== "checked" && updateStatus !== "downloading" && updateStatus !== "installing" ? (
            <ActivityIndicator size={30} color="#037764" />
          ) : (
            <Ionicons name="checkmark-circle" size={30} color="#037764" />
          )}
          <Text
              style={{
                fontFamily: "bangla_medium",
                color: "#037764",
                padding: 5,
              }}
            >
              {updateText}
            </Text>
            {updateStatus === 'downloading' && <Text
              style={{
                fontSize: 12,
                fontFamily: "bangla_regular",
                color: "#ccc",
                padding: 5,
              }}
            >
              ইন্টারনেট সংযোগ চালু রাখুন। আপডেট ডাউনলোড হতে কিছু সময় লাগতে পারে। আপডেট সম্পন্ন হলে এপটি স্বয়ংক্রিয়ভাবে রিস্টার্ট হবে।
            </Text>}
        </View>
      )}
      <View
        style={{
          position: "absolute",
          bottom: 5,
          left: 10,
        }}
      >
        <Text
          style={{
            fontFamily: "bangla_bold",
            fontSize: 12,
            color: "#bbbbbbff",
            padding: 5,
          }}
        >
          Developed by: ROBI APP LAB
        </Text>
      </View>
    </View>
  );
}