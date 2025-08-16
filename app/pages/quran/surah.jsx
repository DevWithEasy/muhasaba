import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AyahItem from "../../../components/quran/AyahItem";
import AyahLoadingScreen from "../../../components/quran/AyahLoadingScreen";
import NoSuraModal from "../../../components/quran/NoSuraModal";
import SuraInfo from "../../../components/quran/SuraInfo";
import {
  checkAudioFileExist,
  getFilePath,
  getJsonData,
  getTiming,
} from "../../../utils/audioControllers";

const MemoizedAyahItem = memo(AyahItem);

export default function SurahScreen() {
  const { id, surahData } = useLocalSearchParams();
  const surahItem = surahData ? JSON.parse(surahData) : null;
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [reciter, setReciter] = useState(null);
  const [sound, setSound] = useState(null);
  const [currentAyahId, setCurrentAyahId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const savedReciter = await AsyncStorage.getItem("reciter");
        setReciter(savedReciter ? parseInt(savedReciter) : 4);

        const ayahFilePath = `${FileSystem.documentDirectory}app_dir/quran/ayah/surah_${surahItem.serial}.json`;
        const fileInfo = await FileSystem.getInfoAsync(ayahFilePath);

        if (!fileInfo.exists) {
          throw new Error("Ayah data not found");
        }
        setAyahs(await getJsonData(ayahFilePath));
      } catch (error) {
        console.error("DB error:", error);
        Alert.alert("ত্রুটি", "আয়াত ডাটা লোড করতে ব্যর্থ");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  const stopAudio = useCallback(async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setCurrentAyahId(null);
      } catch (err) {
        console.error("Error stopping audio:", err);
      }
    }
  }, [sound]);

  const playAyah = useCallback(
    async (surah_id, ayah) => {
      try {
        if (currentAyahId === ayah.id && isPlaying) {
          await stopAudio();
          return;
        }

        const exist = await checkAudioFileExist(reciter, surah_id);

        if (!exist) {
          setModalVisible(true);
          return;
        }

        await stopAudio();

        const audioPath = await getFilePath(reciter, surah_id);

        const timings = await getTiming(reciter, surah_id);
        console.log(timings);

        const currentAyah = timings.find((item) => item.ayah === ayah.id);
        const nextAyah = timings.find((item) => item.ayah === ayah.id + 1);

        console.log(currentAyah);
        console.log(nextAyah);

        const startTime = currentAyah.time;
        const endTime = nextAyah ? nextAyah.time : null;

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioPath },
          { shouldPlay: false }
        );
        setSound(newSound);

        await newSound.setPositionAsync(startTime);
        await newSound.playAsync();

        setIsPlaying(true);
        setCurrentAyahId(ayah.id);

        if (endTime) {
          const duration = endTime - startTime;
          setTimeout(async () => {
            if (newSound) {
              try {
                await newSound.pauseAsync();
                setIsPlaying(false);
                setCurrentAyahId(null);
              } catch (error) {
                console.log("Pause error:", error);
              }
            }
          }, duration);
        }
      } catch (error) {
        console.error("Error playing ayah:", error);
      }
    },
    [reciter, currentAyahId, isPlaying, stopAudio]
  );

  const onDownloadComplete = async () => {
    setModalVisible(false);
  };

  const onDownloadCancelled = () => {
    setModalVisible(false);
  };

  const renderAyahItem = useCallback(
    ({ item }) => (
      <MemoizedAyahItem
        ayah={item}
        surah={surahItem}
        onPlay={playAyah}
        isPlaying={currentAyahId === item.id && isPlaying}
        stopAudio={stopAudio}
      />
    ),
    [surahItem, playAyah, currentAyahId, isPlaying, stopAudio]
  );

  const ListHeaderComponent = useCallback(
    () => (
      <>
        <SuraInfo sura={surahItem} />
        {surahItem.serial > 1 && (
          <Text style={styles.bismillah}>
            بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </Text>
        )}
      </>
    ),
    [surahItem]
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <AyahLoadingScreen surah={surahItem} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: surahItem.name_bn,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/pages/quran/settings')}
              style={{ marginRight: 4 }}
            >
              <Ionicons name="options" size={24} color="#037764" />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={ayahs}
        renderItem={renderAyahItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeaderComponent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        contentContainerStyle={{
          paddingBottom: 0,
          backgroundColor: "#ffffff",
        }}
        style={{ flex: 1 }}
      />
      <NoSuraModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        surah={surahItem}
        reciter={reciter}
        onDownloadComplete={onDownloadComplete}
        onDownloadCancelled={onDownloadCancelled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontFamily: "banglaRegular",
  },
  bismillah: {
    textAlign: "center",
    fontSize: 24,
    fontFamily: "arabic",
    marginVertical: 16,
    color: "#333",
  },
});
