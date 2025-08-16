import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  async function checkFirstInstall() {
    try {
      const isFirst = await AsyncStorage.getItem('is-first-install');
      if (isFirst === null || isFirst !== '1') {
        router.replace('/pages/intro');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error checking first install:', error);
      router.replace('/(tabs)');
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      checkFirstInstall();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}
    >
      <Text style={{fontFamily: 'bangla_bold', fontSize: 50, color: '#037764ff'}}>মুহাসাবা</Text>
      <Text style={{fontFamily: 'bangla_medium', fontSize: 16, color: '#ff1100ff'}}>(আত্মসমালোচনা)</Text>
    </View>
  );
}