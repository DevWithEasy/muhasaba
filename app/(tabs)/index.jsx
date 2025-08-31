import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import PrayerTimeView from "../../components/PrayerTimeView";
import DaroodCalculation from "../../components/calculation/DaroodCalculation";
import DonationCalculation from "../../components/calculation/DonationCalculation";
import FridayAmolCalculation from "../../components/calculation/FridayAmolCalculation";
import HadithCalculation from "../../components/calculation/HadithCalculation";
import IstighfarCalculation from "../../components/calculation/IstighfarCalculation";
import JobCalculation from "../../components/calculation/JobCalculation";
import QuranCalculation from "../../components/calculation/QuranCalculation";
import SalahCalculation from "../../components/calculation/SalahCalculation";
import TasbihCalculation from "../../components/calculation/TasbihCalculation";
import JammatWarning from "../../components/prayer/JamaatWarning";
const APP_DIR = FileSystem.documentDirectory + "app_dir";

// Swipeable Calculation Component
const SwipeableCalculation = ({ children, onSwipeLeft, onSwipeRight, enabled = true }) => {
  const swipeableRef = useRef(null);
  
  const renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50],
      outputRange: [-50, 0],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View
        style={[
          styles.swipeAction,
          styles.swipeLeftAction,
          { transform: [{ translateX: trans }] }
        ]}
      >
        <Text style={styles.swipeActionText}>আপডেট</Text>
      </Animated.View>
    );
  };

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-50, 0],
      outputRange: [0, -50],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View
        style={[
          styles.swipeAction,
          { transform: [{ translateX: trans }] }
        ]}
      >
        <Text style={styles.swipeActionText}>বিস্তারিত</Text>
      </Animated.View>
    );
  };

  if (!enabled) {
    return children;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        if (direction === 'left' && onSwipeLeft) {
          onSwipeLeft();
        } else if (direction === 'right' && onSwipeRight) {
          onSwipeRight();
        }
        setTimeout(() => swipeableRef.current?.close(), 300);
      }}
      friction={2}
      leftThreshold={30}
      rightThreshold={30}
    >
      {children}
    </Swipeable>
  );
};

export default function Index() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const data_files = {
    user: "user_data.json",
    salah: "salah_data.json",
    quran: "quran_data.json",
    hadith: "hadith_data.json",
    darood: "darood_data.json",
    istighfar: "istighfar_data.json",
    tasbih: "tasbih_data.json",
    friday: "friday_data.json",
    goodBadJob: "good_bad_job_data.json",
    donation: "donation_data.json",
  };

  const checkFiles = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(APP_DIR);
      if (!dirInfo.exists) {
        setError("App directory not found");
        setLoading(false);
        return;
      }

      const filesData = {};
      await Promise.all(
        Object.entries(data_files).map(async ([key, filename]) => {
          const filePath = `${APP_DIR}/${filename}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          filesData[key] = fileInfo.exists ? JSON.parse(await FileSystem.readAsStringAsync(filePath)) : [];
        })
      );
      setData(filesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { checkFiles(); }, []));

  const handleSwipeLeft = (screen) => {
    router.push(`/pages/${screen}`);
  };

  const handleSwipeRight = (screen) => {
    router.push(`/pages/amol-nama/${screen}`);
  };

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;
  if (error) return <View style={styles.container}><Text style={styles.error}>Error: {error}</Text></View>;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={{ paddingBottom: 40 }}>
          <PrayerTimeView />
          <JammatWarning salah={data.salah} />
          
          {/* Swipeable Calculation Components */}
          <SwipeableCalculation 
            onSwipeLeft={() => handleSwipeLeft('prayer')}
            onSwipeRight={() => handleSwipeRight('prayer')}
          >
            <SalahCalculation salah={data.salah} />
          </SwipeableCalculation>

          <SwipeableCalculation 
            onSwipeLeft={() => handleSwipeLeft('quran-read')}
            onSwipeRight={() => handleSwipeRight('quran-read')}
          >
            <QuranCalculation quran={data.quran} />
          </SwipeableCalculation>

          <SwipeableCalculation 
            onSwipeLeft={() => handleSwipeLeft('hadith-read')}
            onSwipeRight={() => handleSwipeRight('hadith-read')}
          >
            <HadithCalculation hadith={data.hadith} />
          </SwipeableCalculation>

          <SwipeableCalculation 
            onSwipeLeft={() => handleSwipeLeft('istighfar')}
            onSwipeRight={() => handleSwipeRight('istighfar')}
          >
            <IstighfarCalculation istighfar={data.istighfar} />
          </SwipeableCalculation>

          <SwipeableCalculation 
            onSwipeLeft={() => handleSwipeLeft('donation')}
            onSwipeRight={() => handleSwipeRight('donation')}
          >
            <DonationCalculation donation={data.donation} />
          </SwipeableCalculation>

          <SwipeableCalculation 
            onSwipeLeft={() => handleSwipeLeft('darood')}
            onSwipeRight={() => handleSwipeRight('darood')}
          >
            <DaroodCalculation darood={data.darood} />
          </SwipeableCalculation>

          <SwipeableCalculation 
            onSwipeLeft={() => handleSwipeLeft('good-bad-job')}
            onSwipeRight={() => handleSwipeRight('good-bad-job')}
          >
            <JobCalculation goodBadJob={data.goodBadJob} />
          </SwipeableCalculation>

          <SwipeableCalculation 
            onSwipeLeft={() => handleSwipeLeft('tasbih')}
            onSwipeRight={() => handleSwipeRight('tasbih')}
          >
            <TasbihCalculation tasbih={data.tasbih} />
          </SwipeableCalculation>

          <SwipeableCalculation 
            onSwipeLeft={() => handleSwipeLeft('friday-amol')}
            onSwipeRight={() => handleSwipeRight('friday-amol')}
          >
            <FridayAmolCalculation friday={data.friday} />
          </SwipeableCalculation>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 10,
  },
  swipeAction: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeActionText: {
    fontSize: 12,
    fontFamily: 'bangla_bold',
  },
  error: {
    color: 'red',
  },
});