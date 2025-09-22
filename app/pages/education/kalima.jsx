import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import kalimas from "../../../assets/data/kalimas.json";


export default function Kalima() {
  const [selectedId, setSelectedId] = useState(null);
  const animation = useRef(new Animated.Value(0)).current;
  
  const toggleItem = (id) => {
    if (selectedId === id) {
      // Collapse item
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setSelectedId(null));
    } else {
      // Expand item
      setSelectedId(id);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const renderItem = ({ item, index }) => {
    const isExpanded = selectedId === index;
    
    return (
      <Animated.View 
        style={[
          styles.item, 
          isExpanded && styles.expandedItem,
          {
            shadowOpacity: isExpanded ? 0.2 : 0.1,
            elevation: isExpanded ? 4 : 2,
            transform: [{
              scale: isExpanded ? 1.02 : 1
            }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => toggleItem(index)}
          activeOpacity={0.7}
        >
          <View style={styles.header}>
            <View style={styles.idContainer}>
              <Text style={styles.idText}>{index + 1}</Text>
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.infoContainer}>
                <Text style={styles.titleText}>{item.title}</Text>
              </View>
              
              <View style={styles.arbiContainer}>
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#037764" 
                  style={styles.chevron}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <Animated.View 
            style={[
              styles.details,
              {
                opacity: animation,
                transform: [{
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.arabicContainer}>
              <Text style={styles.arabicText}>{item.arabic}</Text>
            </View>
            
            <View style={styles.fazilatHeader}>
              <Text style={styles.fazilatTitle}>উচ্চারণ</Text>
              <View style={styles.fazilatLine} />
            </View>
            <Text style={styles.fazText}>{item.punctuation}</Text>
            
            <View style={styles.fazilatHeader}>
              <Text style={styles.fazilatTitle}>অর্থ</Text>
              <View style={styles.fazilatLine} />
            </View>
            <Text style={styles.fazText}>{item.translation}</Text>
            
            <View style={styles.fazilatHeader}>
              <Text style={styles.fazilatTitle}>ব্যাখ্যা</Text>
              <View style={styles.fazilatLine} />
            </View>
            <Text style={styles.fazText}>{item.explain}</Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.headerContainer}>
        <Text style={styles.title}>ছয় কালিমা</Text>
        <Text style={styles.subtitle}>ইসলামের মূল ভিত্তিসমূহ</Text>
        <View style={styles.decorativeLine} />
      </View>

      <FlatList
        data={kalimas}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.instructionContainer}>
            <Ionicons name="information-circle" size={20} color="#037764" />
            <Text style={styles.instructionText}>কালিমার উপর ট্যাপ করে বিস্তারিত দেখুন</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    backgroundColor: "#037764",
    padding: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "bangla_bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "bangla_regular",
    fontSize: 16,
  },
  decorativeLine: {
    height: 4,
    width: 60,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 24,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6f7f3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionText: {
    marginLeft: 8,
    fontFamily: 'bangla_regular',
    color: '#037764',
    fontSize: 14,
  },
  item: {
    backgroundColor: "#ffffff",
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#037764",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 5,
    elevation: 1,
  },
  expandedItem: {
    backgroundColor: "#f5f7ff",
    borderWidth: 1,
    borderColor: "rgba(3, 119, 100, 0.1)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  arbiContainer: {
    alignItems: 'flex-end',
  },
  chevron: {
    marginTop: 4,
  },
  titleText: {
    fontSize: 16,
    fontFamily: "bangla_semibold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  idContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#037764",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  idText: {
    color: "#ffffff",
    fontFamily: "bangla_bold",
    fontSize: 16,
  },
  details: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(3, 119, 100, 0.1)",
  },
  arabicContainer: {
    padding: 12,
    backgroundColor: "rgba(3, 119, 100, 0.05)",
    borderRadius: 12,
    marginBottom: 16,
  },
  arabicText: {
    fontSize: 24,
    fontFamily: "ScheherazadeNew-Bold",
    color: "#037764",
    textAlign: "center",
    lineHeight: 40,
  },
  fazilatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  fazilatTitle: {
    fontFamily: 'bangla_bold',
    color: '#037764',
    marginRight: 12,
    fontSize: 16,
  },
  fazilatLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(3, 119, 100, 0.2)',
  },
  fazText: {
    fontFamily: "bangla_regular",
    color: "#34495e",
    lineHeight: 22,
    textAlign: "justify",
    marginBottom: 16,
  },
});