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

const { width } = Dimensions.get('window');

const activityIcons = {
  salat: require("../../assets/images/activity/salat.png"),
  quran: require("../../assets/images/activity/quran.png"),
  hadith: require("../../assets/images/activity/hadith.png"),
  dua: require("../../assets/images/activity/hadith.png"),
};

export default function Education() {
  const router = useRouter();
  const activities = [
    {
      name: "সালাত",
      iconKey: "salat",
      route: "/pages/education/salah",
    },
    {
      name: "কুরআন পড়া",
      iconKey: "quran",
      route: "/pages/education/quran",
    },
    {
      name: "হাদিস পড়া",
      iconKey: "hadith",
      route: "/pages/education/hadith",
    },
    {
      name: "দোয়া",
      iconKey: "hadith",
      route: "/pages/education/dua",
    },
    {
      name: "আসমাউল হুসনা",
      iconKey: "hadith",
      route: "/pages/education/asmaul-husna",
    },
    {
      name: "কালিমা",
      iconKey: "hadith",
      route: "/pages/education/kalima",
    },
        {
      name: "সালাত",
      iconKey: "hadith",
      route: "/pages/education/salah",
    }
  ];

  const itemWidth = (width - 48) / 3; 

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        numColumns={3}
        renderItem={({ item, index }) => (
          <View style={[
            styles.itemWrapper,
            { 
              width: itemWidth,
              marginLeft: index % 3 === 0 ? 16 : 8, 
              marginRight: index % 3 === 2 ? 16 : 0,
            }
          ]}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.itemContainer}>
                <Image 
                  source={activityIcons[item.iconKey]} 
                  style={styles.icon} 
                  resizeMode="contain"
                />
                <Text numberOfLines={2} style={styles.itemText}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: '#f8fafc',
  },
  gridContainer: {
    paddingBottom: 16,
  },
  itemWrapper: {
    marginBottom: 16,
  },
  gridItem: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  itemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  icon: {
    height: 40,
    width: 40,
    marginBottom: 10,
  },
  itemText: {
    fontFamily: "bangla_regular",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
});