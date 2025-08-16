import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { View } from "react-native";

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
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack
        screenOptions={{
          headerTitleAlign : 'center',
          headerTitleStyle : {
            fontFamily : 'bangla_bold',
            // color : '#037764ff'
        },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pages/intro/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pages/intro/muhasaba"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pages/intro/ask_must_read"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pages/intro/ask_age"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pages/intro/ask_prayer_year"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pages/intro/ask_location"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pages/intro/ask_salah_calculation"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pages/prayer"
          options={{
            title : 'নামাজ'
          }}
        />
        <Stack.Screen
          name="pages/quran-read"
          options={{
            title : 'কুরআন পড়া'
          }}
        />
        <Stack.Screen
          name="pages/quran/index"
          options={{
            title : 'কুরআন মাজিদ'
          }}
        />
        <Stack.Screen
          name="pages/quran/surah"
          options={{
            title : 'সূরা ডিটেইলস'
          }}
        />
        <Stack.Screen
          name="pages/quran/settings"
          options={{
            title : 'কুরআন সেটিংস'
          }}
        />
        <Stack.Screen
          name="pages/hadith-read"
          options={{
            title : 'হাদিস পড়া'
          }}
        />
        <Stack.Screen
          name="pages/hadith/index"
          options={{
            title : 'আল হাদিস'
          }}
        />
        <Stack.Screen
          name="pages/hadith/chapters"
          options={{
            title : 'অধ্যায়'
          }}
        />
        <Stack.Screen
          name="pages/hadith/hadiths"
          options={{
            title : 'হাদিস সমুহ'
          }}
        />
        <Stack.Screen
          name="pages/darood"
          options={{
            title : 'দরুদ'
          }}
        />
        <Stack.Screen
          name="pages/darood-count"
          options={{
            title : 'দরুদ গণনা'
          }}
        />
        <Stack.Screen
          name="pages/istighfar"
          options={{
            title : 'ইস্তেগফার'
          }}
        />
        <Stack.Screen
          name="pages/istighfar-count"
          options={{
            title : 'ইস্তেগফার গণনা'
          }}
        />
        <Stack.Screen
          name="pages/tasbih"
          options={{
            title : 'তাসবিহ'
          }}
        />
        <Stack.Screen
          name="pages/tasbih-count"
          options={{
            title : 'তাসবিহ গণনা'
          }}
        />
        <Stack.Screen
          name="pages/good-bad-job"
          options={{
            title : 'ভালো মন্দ কাজ'
          }}
        />
        <Stack.Screen
          name="pages/donation"
          options={{
            title : 'দান সদকা'
          }}
        />
        <Stack.Screen
          name="pages/friday-amol"
          options={{
            title : 'শুক্রবারের আমল'
          }}
        />
        <Stack.Screen
          name="pages/friday-amol-count"
          options={{
            title : 'শুক্রবারের আমল গণনা'
          }}
        />
        <Stack.Screen
          name="pages/todo"
          options={{
            title : 'শুক্রবারের আমল গণনা',
            headerShown : false
          }}
        />
      </Stack>
    </View>
  );
}
