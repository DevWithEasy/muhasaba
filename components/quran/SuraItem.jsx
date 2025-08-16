import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";
import * as FileSystem from "expo-file-system";
const QURAN_DIR = `${FileSystem.documentDirectory}app_dir/quran`;

export default function SuraItem({ item, showModal, setShowModal }) {
  const router = useRouter();
  const handleSurahPress = async (surahItem) => {
    const AYAH_DIR = `${QURAN_DIR}/ayah/surah_${surahItem.serial}.json`;
    const fileInfo = await FileSystem.getInfoAsync(AYAH_DIR);
    if (!fileInfo.exists) {
      setShowModal(true);
      return;
    }
    router.push({
      pathname: `/pages/quran/surah`,
      params: {
        surahData: JSON.stringify(surahItem),
      },
    });
  };

  return (
    <TouchableOpacity
      key={item.serial}
      onPress={() => handleSurahPress(item)}
      style={styles.item}
    >
      <View style={styles.surahContainer}>
        <View style={styles.surahNumber}>
          <Text style={styles.surahNumberText}>
            {convertToBanglaNumbers(item.serial)}
          </Text>
        </View>
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{item.name_bn}</Text>
          <View style={styles.detailsContainer}>
            <Image
              source={
                item.type === "Meccan"
                  ? require("../../assets/images/maccan.png")
                  : require("../../assets/images/madina.png")
              }
              style={styles.cityIcon}
            />
            <Text style={styles.surahDetails}>
              আয়াত - {convertToBanglaNumbers(item.total_ayah)}
            </Text>
          </View>
        </View>
        <Text style={styles.surahNameArabic}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
    marginBottom: 8,
    borderRadius: 8,
    elevation: 0.3,
  },
  surahContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  surahNumber: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: "#138d75",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  surahNumberText: {
    fontFamily: "bangla_bold",
    color: "#ffffff",
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    marginBottom: 4,
    fontFamily: "bangla_medium",
    color: "#138d75",
  },
  surahNameArabic: {
    marginBottom: 4,
    fontFamily: "bangla_regular",
    color: "#979797ff",
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  surahDetails: {
    color: "#7f8c8d",
    marginRight: 8,
    fontFamily: "bangla_regular",
    fontSize: 12,
  },
  cityIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
  },
});
