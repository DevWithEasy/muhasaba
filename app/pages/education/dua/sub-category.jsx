import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

const DUA_DIR = FileSystem.documentDirectory + "app_dir/dua/";
const SUBCATEGORY_FILE = DUA_DIR + "sub_category.json";

export default function SubCategoryScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [subCategories, setSubCategories] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [duasData, setDuasData] = useState({});
  const [loading, setLoading] = useState(true);

  // Params থেকে ডেটা নেওয়া
  const catId = params.catId ? parseInt(params.catId) : null;
  const cateName = params.cateName || "";

  useEffect(() => {
    loadCategories();
  }, [catId]);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const fileInfo = await FileSystem.getInfoAsync(SUBCATEGORY_FILE);
      console.log("File exists:", fileInfo.exists);

      if (!fileInfo.exists) {
        Alert.alert(
          "ত্রুটি",
          "দোয়া ডাটা পাওয়া যায়নি। প্রথমে ডাটা ডাউনলোড করুন।"
        );
        setLoading(false);
        return;
      }

      // JSON ফাইল লোড করুন
      const fileContent = await FileSystem.readAsStringAsync(SUBCATEGORY_FILE);
      const data = JSON.parse(fileContent);

      // catId অনুসারে ফিল্টার করুন
      if (catId) {
        const filteredSubCategories = data.filter(
          (item) => item.cat_id === catId
        );
        setSubCategories(filteredSubCategories);
      } else {
        setSubCategories(data);
      }
    } catch (error) {
      console.error("Categories লোড করতে ত্রুটি:", error);
      Alert.alert("ত্রুটি", "Categories লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = async (subCategory) => {
    const isExpanded = expandedSections[subCategory.subcat_id];

    if (!isExpanded && !duasData[subCategory.subcat_id]) {
      try {
        // এখানে আসল dua.json থেকে ডেটা লোড করুন
        const duaFilePath = DUA_DIR + "dua.json";
        const duaFileContent = await FileSystem.readAsStringAsync(duaFilePath);
        const allDuas = JSON.parse(duaFileContent);

        // subcat_id অনুসারে ফিল্টার করুন
        const filteredDuas = allDuas.filter(
          (dua) => dua.subcat_id === subCategory.subcat_id
        );

        setDuasData((prev) => ({
          ...prev,
          [subCategory.subcat_id]: filteredDuas,
        }));
      } catch (error) {
        console.error("দোয়া লোড করতে ত্রুটি:", error);
        // Fallback mock data
        const mockDuas = [
          { dua_id: 1, dua_name_bn: "দোয়া ১" },
          { dua_id: 2, dua_name_bn: "দোয়া ২" },
          { dua_id: 3, dua_name_bn: "দোয়া ৩" },
        ];

        setDuasData((prev) => ({
          ...prev,
          [subCategory.subcat_id]: mockDuas,
        }));
      }
    }

    setExpandedSections((prev) => ({
      ...prev,
      [subCategory.subcat_id]: !isExpanded,
    }));
  };

  const navigateToDuaDetails = (subCatName, duas, currentIndex) => {
    router.push({
      pathname: "/pages/dua/dua-collection",
      params: {
        catName: cateName,
        subCatName,
        currentIndex: currentIndex.toString(),
        duas: JSON.stringify(duas),
      },
    });
  };

  const enToBnNumber = (number) => {
    const bnNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return number.toString().replace(/\d/g, (digit) => bnNumbers[digit]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00897B" />
        <Text style={[styles.loadingText, { marginTop: 10 }]}>
          লোড হচ্ছে...
        </Text>
      </View>
    );
  }

  if (subCategories.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noDataText}>কোন সাব-ক্যাটাগরি পাওয়া যায়নি</Text>
        <Text style={styles.catIdText}>catId: {catId}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title:cateName,
        }}
      />
      <View style={styles.header}>
        <Text style={styles.subTitle}>
          মোট {enToBnNumber(subCategories.length.toString())} টি সাব-ক্যাটাগরি
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.listContainer}>
          {subCategories.map((subCategory, index) => {
            const isExpanded = expandedSections[subCategory.subcat_id];
            const duas = duasData[subCategory.subcat_id] || [];

            return (
              <View
                key={subCategory.subcat_id + index}
                style={styles.categoryCard}
              >
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleSection(subCategory)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {enToBnNumber((index + 1).toString())}
                    </Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>
                      {subCategory.subcat_name_bn}
                    </Text>
                    <Text style={styles.subCategoryCount}>
                      সর্বমোট {enToBnNumber(subCategory.no_of_dua.toString())}{" "}
                      টি দোয়া রয়েছে
                    </Text>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.duasContainer}>
                    {duas.length === 0 ? (
                      <ActivityIndicator size="small" color="#00897B" />
                    ) : (
                      duas.map((dua, duaIndex) => (
                        <TouchableOpacity
                          key={dua.dua_id + duaIndex}
                          style={styles.duaItem}
                          onPress={() =>
                            navigateToDuaDetails(
                              subCategory.subcat_name_bn,
                              duas,
                              duaIndex
                            )
                          }
                        >
                          <View style={styles.duaAvatar}>
                            <Text style={styles.duaAvatarText}>
                              {enToBnNumber((duaIndex + 1).toString())}
                            </Text>
                          </View>
                          <Text style={styles.duaName}>{dua.dua_name_bn}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 16,
  },
  subTitle: {
    textAlign: "center",
    marginTop: 5,
    fontFamily: "bangla_semibold",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "bangla_regular",
  },
  noDataText: {
    fontFamily: "bangla_regular",
  },
  catIdText: {
    fontFamily: "bangla_regular",
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 12,
  },
  categoryCard: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0.8,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00897B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontFamily: "bangla_bold",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    marginBottom: 4,
    fontFamily: "bangla_semibold",
  },
  subCategoryCount: {
    color: "#888",
    fontSize: 14,
    fontFamily: "bangla_regular",
  },
  duasContainer: {
    marginTop: 12,
    marginLeft: 24,
    borderLeftWidth: 2,
    borderLeftColor: "#e0e0e0",
    paddingLeft: 12,
  },
  duaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  duaAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  duaAvatarText: {
    color: "#333",
    fontSize: 12,
    fontFamily: "bangla_bold",
  },
  duaName: {
    flex: 1,
    fontFamily: "bangla_semibold",
  },
});
