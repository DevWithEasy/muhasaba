import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { FontSizeProvider } from "../contexts/FontSizeContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    bangla_light: require("../assets/fonts/bangla_light.ttf"),
    bangla_regular: require("../assets/fonts/bangla_regular.ttf"),
    bangla_medium: require("../assets/fonts/bangla_medium.ttf"),
    bangla_semibold: require("../assets/fonts/bangla_semiBold.ttf"),
    bangla_bold: require("../assets/fonts/bangla_bold.ttf"),
    arabic: require("../assets/fonts/arabic.otf"),
    "me-quran": require("../assets/fonts/me_quran.ttf"),
    noorehidayat: require("../assets/fonts/noorehidayat.ttf"),
    noorehira: require("../assets/fonts/noorehira.ttf"),
    noorehuda: require("../assets/fonts/noorehuda.ttf"),
    qalam: require("../assets/fonts/qalam.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <FontSizeProvider>
          <Stack
            screenOptions={{
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontFamily: "bangla_bold",
                fontSize: 18,
              },
              headerBackTitleVisible: false,
              headerTintColor: "#037764",
              headerStyle: {
                backgroundColor: "#f8fafc",
              },
            }}
          >
            {/* Auth Screens */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="pages/intro/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/intro/muhasaba"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/intro/ask_must_read"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/intro/ask_age"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/intro/ask_prayer_year"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/intro/ask_location"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/intro/ask_salah_calculation"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/intro/ask_notification"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="pages/backup/index"
              options={{ title: "ব্যাকআপ ডাটা", headerBackTitle: "পিছনে" }}
            />
            <Stack.Screen
              name="pages/backup/restore"
              options={{
                title: "রিস্টোর ব্যাকআপ ডাটা",
                headerBackTitle: "পিছনে",
              }}
            />

            {/* Main Tabs */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* Prayer Screens */}
            <Stack.Screen
              name="pages/prayer"
              options={{
                title: "নামাজের সময়সূচী",
                headerBackTitle: "পিছনে",
              }}
            />

            <Stack.Screen
              name="pages/amol-nama/prayer"
              options={{
                title: "সালাত পরিসংখ্যান",
                headerBackTitle: "পিছনে",
              }}
            />

            <Stack.Screen
              name="pages/amol-nama/quran-read"
              options={{
                title: "কুরআন পরিসংখ্যান",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/amol-nama/hadith-read"
              options={{
                title: "হাদিস পরিসংখ্যান",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/amol-nama/istighfar"
              options={{
                title: "ইস্তিগফার পরিসংখ্যান",
                headerBackTitle: "পিছনে",
              }}
            />

            <Stack.Screen
              name="pages/amol-nama/donation"
              options={{
                title: "দান করার পরিসংখ্যান",
                headerBackTitle: "পিছনে",
              }}
            />

            <Stack.Screen
              name="pages/amol-nama/darood"
              options={{
                title: "দরুদ পরিসংখ্যান",
                headerBackTitle: "পিছনে",
              }}
            />

            <Stack.Screen
              name="pages/amol-nama/good-bad-job"
              options={{
                title: "ভালো ও খারাপ কাজের পরিসংখ্যান",
                headerBackTitle: "পিছনে",
              }}
            />

            <Stack.Screen
              name="pages/amol-nama/tasbih"
              options={{
                title: "তাসবিহ গণনার পরিসংখ্যান",
                headerBackTitle: "পিছনে",
              }}
            />

            <Stack.Screen
              name="pages/amol-nama/friday-amol"
              options={{
                title: "শুক্রবার আমলের পরিসংখ্যান",
                headerBackTitle: "পিছনে",
              }}
            />

            {/* Quran Screens */}
            <Stack.Screen
              name="pages/quran-read"
              options={{
                title: "কুরআন তিলাওয়াত",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/education/quran/index"
              options={{
                title: "কুরআন মাজিদ",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/education/quran/surah"
              options={{
                title: "সূরার বিবরণ",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/education/quran/settings"
              options={{
                title: "কুরআন সেটিংস",
                headerBackTitle: "পিছনে",
              }}
            />

            {/* Hadith Screens */}
            <Stack.Screen
              name="pages/hadith-read"
              options={{
                title: "হাদিস অধ্যায়ন",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/education/hadith/index"
              options={{
                title: "হাদিস গ্রন্থাবলী",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/education/hadith/chapters"
              options={{
                title: "হাদিস অধ্যায়",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/education/hadith/hadiths"
              options={{
                title: "হাদিস সমূহ",
                headerBackTitle: "পিছনে",
              }}
            />

            {/* Dhikr Screens */}
            <Stack.Screen
              name="pages/darood"
              options={{
                title: "দরুদ শরীফ",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/darood-count"
              options={{
                title: "দরুদ গণনা",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/istighfar"
              options={{
                title: "ইস্তেগফার",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/istighfar-count"
              options={{
                title: "ইস্তেগফার গণনা",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/tasbih"
              options={{
                title: "তাসবিহ",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/tasbih-count"
              options={{
                title: "তাসবিহ গণনা",
                headerBackTitle: "পিছনে",
              }}
            />

            {/* Other Islamic Practices */}
            <Stack.Screen
              name="pages/good-bad-job"
              options={{
                title: "ভালো-মন্দ আমল",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/donation"
              options={{
                title: "দান-সদকা",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/friday-amol"
              options={{
                title: "জুমার আমল",
                headerBackTitle: "পিছনে",
              }}
            />
            <Stack.Screen
              name="pages/friday-amol-count"
              options={{
                title: "জুমার আমল গণনা",
                headerBackTitle: "পিছনে",
              }}
            />

            {/* Todo Screen */}
            <Stack.Screen
              name="pages/todo"
              options={{
                title: "আমলের তালিকা",
                headerShown: false,
              }}
            />
          </Stack>
        </FontSizeProvider>
      </View>
    </GestureHandlerRootView>
  );
}
