import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    checkForUpdates(); // check update on mount

    return () => unsubscribe();
  }, [isConnected]);

  async function checkForUpdates() {
    if (__DEV__) {
      setTimeout(() => {
        checkFirstInstall();
      }, 2000);
      return;
    }

    if (!isConnected) {
      setTimeout(() => {
        checkFirstInstall();
      }, 2000);
      return;
    }

    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setShowUpdateModal(true);
        setUpdateStatus("checked");
      } else {
        setTimeout(() => {
          checkFirstInstall();
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      setTimeout(() => {
        checkFirstInstall();
      }, 2000);
    }
  }

  async function handleUpdatePress() {
    setUpdateStatus("downloading");

    try {
      await Updates.fetchUpdateAsync();
      setUpdateStatus("installing");
      await Updates.reloadAsync();
      // After reload, app will restart, so no next line necessary.
    } catch (error) {
      console.error("Error during update process:", error);
      // Reset UI so user can retry or continue
      setUpdateStatus("");
      setShowUpdateModal(false);
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

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      <Image
        source={require("../assets/images/adaptive-icon.png")}
        style={{ width: 90, height: 90 }}
      />
      <Text
        style={{
          fontFamily: "bangla_bold",
          fontSize: 40,
          color: "#037764",
          marginTop: -15,
        }}
      >
        মুহাসাবা
      </Text>
      <Text
        style={{
          fontFamily: "bangla_medium",
          color: "#797979ff",
        }}
      >
        আপনার আত্ন উন্নয়নের সঙ্গী
      </Text>

      {!isConnected && (
        <View
          style={{
            marginTop: 30,
            paddingVertical: 2,
            paddingHorizontal: 5,
            backgroundColor: "#ffebee",
            borderRadius: 5,
          }}
        >
          <Text
            style={{
              fontFamily: "bangla_regular",
              color: "#d32f2f",
              textAlign: "center",
              fontSize: 10,
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
            bottom: 40,
            marginTop: 40,
            width: "100%",
            alignItems: "center",
            marginHorizontal: 20,
            padding: 5,
            borderRadius: 5,
          }}
        >
          {updateStatus === "checked" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderWidth: 0.5,
                borderColor: "#037764",
                paddingVertical: 5,
                paddingHorizontal: 10,
                backgroundColor: "#03776415",
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "bangla_regular",
                  fontSize: 14,
                  color: "#037764",
                }}
              >
                নতুন আপডেট পাওয়া গেছে
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#037764",
                  borderRadius: 4,
                }}
                onPress={handleUpdatePress}
              >
                <Text
                  style={{
                    fontFamily: "bangla_regular",
                    fontSize: 13,
                    color: "#fff",
                    paddingVertical: 2,
                    paddingHorizontal: 5,
                  }}
                >
                  আপডেট করুন
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {updateStatus === "downloading" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderWidth: 0.5,
                borderColor: "#037764",
                paddingVertical: 5,
                paddingHorizontal: 10,
                backgroundColor: "#03776415",
                borderRadius: 8,
              }}
            >
              <ActivityIndicator size="small" color="#037764" />
              <Text
                style={{
                  fontFamily: "bangla_regular",
                  fontSize: 14,
                  color: "#037764",
                }}
              >
                আপডেট হচ্ছে। অপেক্ষা করুন . . .
              </Text>
            </View>
          )}
          {updateStatus === "installing" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderWidth: 0.5,
                borderColor: "#037764",
                paddingVertical: 5,
                paddingHorizontal: 10,
                backgroundColor: "#03776415",
                borderRadius: 8,
              }}
            >
              <ActivityIndicator size="small" color="#037764" />
              <Text
                style={{
                  fontFamily: "bangla_regular",
                  fontSize: 14,
                  color: "#037764",
                }}
              >
                আপডেট ইন্সটল হচ্ছে . . .
              </Text>
            </View>
          )}
        </View>
      )}

      <View
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
        }}
      >
        <Text
          style={{
            fontFamily: "bangla_bold",
            fontSize: 10,
            color: "#bbbbbbff",
            padding: 5,
            fontStyle: "italic",
          }}
        >
          Developed by: RobiAppLab
        </Text>
      </View>
    </View>
  );
}