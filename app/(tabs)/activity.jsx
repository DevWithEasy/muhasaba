import { useRouter } from "expo-router";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const activityIcons = {
  salat: require("../../assets/images/activity/salat.png"),
  tasbih: require("../../assets/images/activity/tasbih.png"),
  good_job: require("../../assets/images/activity/good-job.png"),
  donation: require("../../assets/images/activity/donation.png"),
  quran: require("../../assets/images/activity/quran.png"),
  hadith: require("../../assets/images/activity/hadith.png"),
  friday: require("../../assets/images/activity/friday.png"),
  checklist: require("../../assets/images/activity/checklist.png"),
};

export default function Activity() {
  const router = useRouter();
  
  const sections = [
    {
      title: "ইবাদত",
      data: [
        {
          name: "সালাত",
          iconKey: "salat",
          route: "/pages/prayer",
          description: "নামাজের সময়সূচী এবং ট্র্যাকিং",
          color: "#10B981"
        },
        {
          name: "দরুদ",
          iconKey: "tasbih",
          route: "/pages/darood",
          description: "দরুদ শরীফ পাঠ এবং গণনা",
          color: "#F59E0B"
        },
        {
          name: "ইস্তেগফার",
          iconKey: "tasbih",
          route: "/pages/istighfar",
          description: "ইস্তেগফার পাঠ এবং রেকর্ড",
          color: "#06B6D4"
        },
        {
          name: "তাসবিহ",
          iconKey: "tasbih",
          route: "/pages/tasbih",
          description: "তাসবিহ গণনা এবং ট্র্যাকিং",
          color: "#84CC16"
        },
      ]
    },
    {
      title: "কুরআন ও হাদিস",
      data: [
        {
          name: "কুরআন পড়া",
          iconKey: "quran",
          route: "/pages/quran-read",
          description: "কুরআন তিলাওয়াত এবং অধ্যায়",
          color: "#3B82F6"
        },
        {
          name: "হাদিস পড়া",
          iconKey: "hadith",
          route: "/pages/hadith-read",
          description: "দৈনিক হাদিস পড়া এবং শেয়ারিং",
          color: "#8B5CF6"
        },
      ]
    },
    {
      title: "দৈনিক আমল",
      data: [
        {
          name: "ভালো মন্দ কাজ",
          iconKey: "good_job",
          route: "/pages/good-bad-job",
          description: "দৈনিক ভালো-মন্দ কাজের রেকর্ড",
          color: "#EC4899"
        },
        {
          name: "দান সদকা",
          iconKey: "donation",
          route: "/pages/donation",
          description: "দান-সদকার হিসাব এবং ট্র্যাকিং",
          color: "#F97316"
        },
        {
          name: "শুক্রবার আমল",
          iconKey: "friday",
          route: "/pages/friday-amol",
          description: "শুক্রবারের বিশেষ আমলসমূহ",
          color: "#6366F1"
        },
        {
          name: "দৈনিক কর্মতালিকা",
          iconKey: "checklist",
          route: "/pages/todo",
          description: "দৈনিক কাজের চেকলিস্ট",
          color: "#14B8A6"
        },
      ]
    }
  ];

  const ListItem = ({ item }) => {
    const handlePress = () => {
      router.push(item.route);
    };

    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          { 
            borderLeftWidth: 4,
            borderLeftColor: item.color,
          }
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.itemContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
            <Image 
              source={activityIcons[item.iconKey]} 
              style={styles.listIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.listItemText}>{item.name}</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={[styles.arrow, { color: item.color }]}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {item.data.map((activity, index) => (
              <ListItem key={index} item={activity} />
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "bangla_bold",
    fontSize: 17,
    color: "#037764",
    marginBottom: 12,
    paddingLeft: 8,
  },
  listItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 10,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 16,
  },
  listIcon: {
    height: 28,
    width: 28,
    tintColor: '#037764',
  },
  textContainer: {
    flex: 1,
  },
  listItemText: {
    fontFamily: "bangla_bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  descriptionText: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  arrow: {
    fontSize: 28,
    fontWeight: "bold",
  },
});