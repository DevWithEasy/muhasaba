import { useRouter } from 'expo-router';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import categories from '../../../../assets/data/salah_category.json';

// Static image mapping
const imageMap = {
  'shower.png': require('../../../../assets/images/salah/shower.png'),
  'wudu.png': require('../../../../assets/images/salah/wudu.png'),
  'tayammum.png': require('../../../../assets/images/salah/tayammum.png'),
  'adhan.png': require('../../../../assets/images/salah/adhan.png'),
  'salah.png': require('../../../../assets/images/salah/salah.png'),
};

export default function SalahScreen() {
  const router = useRouter();

  const renderCategoryItem = ({ item, index }) => {
    // Get the image from the static mapping
    const imageSource = imageMap[item.image];
    
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => router.push({
          pathname: '/pages/education/salah/salah-topics',
          params: {
            cateName: item.name,
            catId: item.id.toString()
          }
        })}
        style={styles.item}
      >
        <View style={styles.categoryContainer}>
          <View style={styles.categoryIcon}>
            <Image source={imageSource} style={styles.categoryImage} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.categoryDetails}>
                {getCategoryDescription(item.id)}
              </Text>
            </View>
          </View>
          <Text style={styles.categoryNameArabic}>
            {getCategoryArabicName(item.id)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Helper function to get category description
  const getCategoryDescription = (categoryId) => {
    const descriptions = {
      1: "পরিচ্ছন্নতা ও পবিত্রতা",
      2: "অজুর বিস্তারিত পদ্ধতি",
      3: "পানি না থাকলে তায়াম্মুম",
      4: "নামাজের জন্য ডাক",
      5: "ওয়াক্ত ও রাকাত সংখ্যা",
      6: "সালাত আদায়ের সহজ পদ্ধতি",
      7: "ধাপে ধাপে সালাত",
      8: "বিশেষ সালাতের নিয়ম"
    };
    return descriptions[categoryId] || "বিস্তারিত জানুন";
  };

  // Helper function to get Arabic name
  const getCategoryArabicName = (categoryId) => {
    const arabicNames = {
      1: "الطهارة",
      2: "الوضوء",
      3: "التيمم",
      4: "الأذان",
      5: "أوقات الصلاة",
      6: "طريقة الصلاة",
      7: "خطوات الصلاة",
      8: "صلوات خاصة"
    };
    return arabicNames[categoryId] || "الصلاة";
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: "#138d7530",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryImage: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    marginBottom: 4,
    fontFamily: "bangla_medium",
    color: "#138d75",
  },
  categoryNameArabic: {
    fontSize: 14,
    fontFamily: "arabic_regular",
    color: "#979797",
    textAlign: 'right',
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDetails: {
    color: "#7f8c8d",
    marginRight: 8,
    fontFamily: "bangla_regular",
    fontSize: 12,
  },
});