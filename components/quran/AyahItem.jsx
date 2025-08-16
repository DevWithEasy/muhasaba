import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import useSettingsStore from "../../store/settingsStore";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

export default function AyahItem({
  surah,
  ayah,
  onPlay,
  isPlaying,
  stopAudio,
}) {
  const {
    arabicFont,
    arabicFontSize,
    banglaFontSize,
    translator,
    showBanglaTranslation,
    showBanglaTafseer,
    showEnglishTranslation,
  } = useSettingsStore();

  return (
    <View key={ayah.id} style={styles.ayahContainer}>
      <View style={styles.ayahHeader}>
        <View style={styles.ayahNumber}>
          <Text style={styles.ayahNumberText}>
            {convertToBanglaNumbers(surah.serial)}:
            {convertToBanglaNumbers(ayah.id)}
          </Text>
        </View>
        {isPlaying ? (
          <Ionicons name="pause" size={20} color="#d80024ff" onPress={stopAudio}/>
        ) : (
          <Ionicons name="play" size={20} color="#138d75" onPress={()=>onPlay(surah.serial,ayah)} />
        )}
      </View>

      <View style={styles.ayahContent}>
        <Text
          style={[
            styles.ayahText,
            { fontFamily: arabicFont, fontSize: arabicFontSize },
          ]}
        >
          {ayah.ar}
        </Text>
        {showBanglaTranslation && (
          <Text style={[styles.translation, { fontSize: banglaFontSize }]}>
            {ayah.tr}
          </Text>
        )}
        {showBanglaTafseer && (
          <Text style={[styles.translation, { fontSize: banglaFontSize }]}>
            {translator === "bn_muhi" ? ayah.bn_muhi : ayah.bn_haque}
          </Text>
        )}
        {showEnglishTranslation && (
          <Text style={[styles.translation, { fontSize: banglaFontSize }]}>
            {ayah.en}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ayahContainer: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ayahHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    marginRight: 4,
  },
  ayahNumber: {
    backgroundColor: "#138d75",
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 12,
  },
  ayahNumberText: {
    fontSize: 12,
    color: "#ffffff",
    fontFamily: "bangla_bold",
  },
  ayahContent: {
    marginBottom: 16,
  },
  ayahText: {
    fontSize: 24,
    textAlign: "right",
    lineHeight: 40,
    marginBottom: 12,
  },
  translation: {
    lineHeight: 24,
    color: "#333",
    marginBottom: 8,
    fontFamily: "bangla_regular",
  },
});
