import { useRouter } from "expo-router";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const activityIcons = {
  salat: require("../../assets/images/activity/salat.png"),
  quran: require("../../assets/images/activity/quran.png"),
  hadith: require("../../assets/images/activity/hadith.png"),
  dua: require("../../assets/images/activity/dua.png"),
  allah: require("../../assets/images/activity/allah.png"),
  kalima: require("../../assets/images/activity/kalima.png"),
};

// আইকনের জন্য গ্রেডিয়েন্ট কালার
const iconColors = {
  salat: ["#4CAF50", "#45a049"],
  quran: ["#2196F3", "#1976D2"],
  hadith: ["#FF9800", "#F57C00"],
  dua: ["#9C27B0", "#7B1FA2"],
  allah: ["#F44336", "#D32F2F"],
  kalima: ["#607D8B", "#455A64"],
};

export default function Education() {
  const router = useRouter();

  const activities = [
    {
      name: "সালাত",
      iconKey: "salat",
      route: "/pages/education/salah",
      description: "নামাজ শিখুন",
    },
    {
      name: "কুরআন",
      iconKey: "quran",
      route: "/pages/education/quran",
      description: "কুরআন শিক্ষা",
    },
    {
      name: "হাদিস",
      iconKey: "hadith",
      route: "/pages/education/hadith",
      description: "হাদিস অধ্যয়ন",
    },
    {
      name: "দোয়া",
      iconKey: "dua",
      route: "/pages/education/dua",
      description: "প্রার্থনা শিখুন",
    },
    {
      name: "আসমাউল হুসনা",
      iconKey: "allah",
      route: "/pages/education/asmaul-husna",
      description: "আল্লাহর নামসমূহ",
    },
    {
      name: "কালিমা",
      iconKey: "kalima",
      route: "/pages/education/kalima",
      description: "কালিমা শিক্ষা",
    }
  ];

  const itemWidth = (width - 48) / 2; 

  const renderGridItem = ({ item, index }) => (
    <View style={[styles.itemWrapper, { width: itemWidth }]}>
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => router.push(item.route)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconColors[item.iconKey]?.[0] + "15" },
          ]}
        >
          <Image
            source={activityIcons[item.iconKey]}
            style={styles.icon}
            resizeMode="contain"
            tintColor={iconColors[item.iconKey]?.[0]}
          />
        </View>

        <Text numberOfLines={1} style={styles.itemText}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={styles.itemDescription}>
          {item.description}
        </Text>

        {/* Hover effect indicator */}
        <View
          style={[
            styles.hoverIndicator,
            { backgroundColor: iconColors[item.iconKey]?.[0] },
          ]}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        numColumns={2}
        renderItem={renderGridItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  gridContainer: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    gap: 16, // Use gap instead of margin for consistent spacing
  },
  itemWrapper: {
    marginBottom: 16,
  },
  gridItem: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1.5,
    padding: 16,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    height: 28,
    width: 28,
  },
  itemText: {
    fontFamily: "bangla_semibold",
    textAlign: "center",
    lineHeight: 20,
    color: "#2d3748",
    marginBottom: 4,
  },
  itemDescription: {
    fontFamily: "bangla_regular",
    textAlign: "center",
    fontSize: 12,
    color: "#718096",
    lineHeight: 16,
  },
  hoverIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0,
  },
});