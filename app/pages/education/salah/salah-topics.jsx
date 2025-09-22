import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import topicsData from "../../../../assets/data/salah_topics.json";
import topicsDetailsData from "../../../../assets/data/salah_topics_details.json";

// Static image mapping
const imageMap = {
  "shower.png": require("../../../../assets/images/salah/shower.png"),
  "wudu.png": require("../../../../assets/images/salah/wudu.png"),
  "tayammum.png": require("../../../../assets/images/salah/tayammum.png"),
  "adhan.png": require("../../../../assets/images/salah/adhan.png"),
  "salah.png": require("../../../../assets/images/salah/salah.png"),
  "niyat.png": require("../../../../assets/images/salah/niyat.png"),
  "ruku.png": require("../../../../assets/images/salah/ruku.png"),
  "takber.png": require("../../../../assets/images/salah/takber.png"),
  "sana.png": require("../../../../assets/images/salah/sana.png"),
  "sajdah.png": require("../../../../assets/images/salah/sajdah.png"),
  "tasahadud.png": require("../../../../assets/images/salah/tasahadud.png"),
  "salam.png": require("../../../../assets/images/salah/salam.png"),
  "dua.png": require("../../../../assets/images/salah/dua.png"),
};

export default function SalahTopicsScreen() {
  const { cateName, catId } = useLocalSearchParams();
  const router = useRouter();
  const [topics, setTopics] = useState(null);
  const [topicsDetails, setTopicsDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setTopics(topicsData.filter((item) => item.cat_id.toString() === catId));
      setTopicsDetails(
        topicsDetailsData.filter((item) => item.cat_id.toString() === catId)
      );
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicPress = (subCategory, index) => {
    router.push({
      pathname: "/pages/education/salah/topics-details",
      params: {
        catName: cateName,
        subCatName: subCategory.title,
        currentIndex: index.toString(),
        topics: JSON.stringify(topics),
        topicsDetails: JSON.stringify(topicsDetails),
      },
    });
  };

  const renderTopicItem = ({ item, index }) => {
    const imageSource = imageMap[item.image];
    
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleTopicPress(item, index)}
        style={styles.item}
      >
        <View style={styles.topicContainer}>
          <View style={styles.topicIcon}>
            <Image source={imageSource} style={styles.topicImage} />
          </View>
          <View style={styles.topicInfo}>
            <Text style={styles.topicName}>{item.title}</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.topicDetails}>
                {item.description}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#138d75" />
      </View>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>কোন সাবক্যাটাগরি পাওয়া যায়নি</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={topics}
        renderItem={renderTopicItem}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f2',
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#ecf0f2',
  },
  listContainer: {
    padding: 16,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  topicContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicIcon: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: "#138d7530",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  topicImage: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    marginBottom: 4,
    fontFamily: "bangla_medium",
    color: "#138d75",
  },
  topicNameArabic: {
    fontSize: 14,
    fontFamily: "arabic_regular",
    color: "#979797",
    textAlign: 'right',
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicDetails: {
    color: "#7f8c8d",
    marginRight: 8,
    fontFamily: "bangla_regular",
    fontSize: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontFamily: "bangla_regular",
  },
});