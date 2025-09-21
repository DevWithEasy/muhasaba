import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import kalimas from "../../../assets/data/kalimas.json";

export default function Kalima() {
  const [expandedKalima, setExpandedKalima] = useState(null);
  const { width } = useWindowDimensions();

  const toggleKalima = (index) => {
    if (expandedKalima === index) {
      setExpandedKalima(null);
    } else {
      setExpandedKalima(index);
    }
  };

  const arabicTagsStyles = {
    body: {
      whiteSpace: "normal",
      fontSize: 24,
      textAlign: "center",
      lineHeight: 40,
      color: "#2e7d32",
      fontFamily: "ScheherazadeNew-Bold",
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2e7d32" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>ছয় কালিমা</Text>
        <Text style={styles.headerSubtitle}>ইসলামের মূল ভিত্তিসমূহ</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {kalimas.map((kalima, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.kalimaCard,
              expandedKalima === index && styles.expandedCard,
            ]}
            onPress={() => toggleKalima(index)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.numberContainer}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <Text style={styles.titleText}>{kalima.title}</Text>
              <Ionicons
                name={expandedKalima === index ? "chevron-up" : "chevron-down"}
                size={24}
                color="#2e7d32"
              />
            </View>

            {expandedKalima === index && (
              <View style={styles.cardContent}>
                <View style={styles.arabicContainer}>
                  <Text styles={arabicTagsStyles}>{kalima.arabic}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>উচ্চারণ</Text>
                  <Text style={styles.punctuationText}>
                    {kalima.punctuation}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>অর্থ</Text>
                  <Text style={styles.translationText}>
                    {kalima.translation}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>ব্যাখ্যা</Text>
                  <Text style={styles.explanationText}>{kalima.explain}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            কালিমাসমূহ মুখস্থ করুন ও আমল করুন
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9f5",
  },
  header: {
    backgroundColor: "#2e7d32",
    padding: 20,
    paddingTop: 50,
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
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "bangla_bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "bangla_regular",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  kalimaCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  expandedCard: {
    backgroundColor: "#f1f8e9",
    shadowColor: "#2e7d32",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  numberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2e7d32",
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    color: "#ffffff",
    fontFamily: "bangla_bold",
    fontSize: 16,
  },
  titleText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontFamily: "bangla_bold",
    color: "#2e7d32",
  },
  cardContent: {
    marginTop: 16,
  },
  arabicContainer: {
    padding: 12,
    backgroundColor: "rgba(46, 125, 50, 0.05)",
    borderRadius: 12,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "bangla_bold",
    color: "#2e7d32",
    marginBottom: 8,
  },
  punctuationText: {
    fontSize: 16,
    fontFamily: "bangla_regular",
    color: "#5a6b7d",
    lineHeight: 24,
    textAlign: "center",
  },
  translationText: {
    fontSize: 16,
    fontFamily: "bangla_regular",
    color: "#34495e",
    lineHeight: 24,
    textAlign: "justify",
  },
  explanationText: {
    fontSize: 15,
    fontFamily: "bangla_regular",
    color: "#2c3e50",
    lineHeight: 22,
    textAlign: "justify",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(46, 125, 50, 0.2)",
    marginVertical: 16,
  },
  footer: {
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "bangla_regular",
    color: "#7f8c8d",
    fontStyle: "italic",
  },
});
