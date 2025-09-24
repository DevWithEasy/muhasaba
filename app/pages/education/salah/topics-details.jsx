import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RenderHtml, { defaultSystemFonts } from "react-native-render-html";
import { useFontSize } from "../../../../contexts/FontSizeContext";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const systemFonts = [...defaultSystemFonts, "bangla_regular"];

export default function SalahTopicsDetailScreen() {
  const { catName, subCatName, currentIndex, topics, topicsDetails } =
    useLocalSearchParams();

  const router = useRouter();
  const { banglaFontSize, updateBanglaFontSize } = useFontSize();

  const [currentPageIndex, setCurrentPageIndex] = useState(
    parseInt(currentIndex) || 0
  );
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const modalAnimation = useRef(new Animated.Value(0)).current;

  const parsedTopics = topics ? JSON.parse(topics) : [];
  const parsedTopicsDetails = topicsDetails ? JSON.parse(topicsDetails) : [];

  useEffect(() => {
    if (showSettingsModal) {
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showSettingsModal]);

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          modalAnimation.setValue(gestureState.dy / SCREEN_HEIGHT);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          Animated.timing(modalAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const openModal = () => {
    setShowSettingsModal(true);
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowSettingsModal(false);
    });
  };

  const handlePageChange = (index) => {
    setCurrentPageIndex(index);
  };

  const renderContent = () => {
    if (!parsedTopicsDetails || parsedTopicsDetails.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={{ fontFamily: "bangla_regular" }}>
            কোন কন্টেন্ট পাওয়া যায়নি
          </Text>
        </View>
      );
    }

    const currentTopic = parsedTopicsDetails[currentPageIndex];

    if (!currentTopic || !currentTopic.description) {
      return (
        <View style={styles.centerContainer}>
          <Text style={{ fontFamily: "bangla_regular" }}>
            বর্ণনা পাওয়া যায়নি
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.contentContainer}>
        <RenderHtml
          systemFonts={systemFonts}
          contentWidth={Dimensions.get("window").width - 32}
          source={{ html: currentTopic.description }}
          baseStyle={{
            fontSize: banglaFontSize,
            lineHeight: banglaFontSize * 1.6,
            textAlign: "justify",
            fontFamily: "bangla_regular",
          }}
          tagsStyles={{
            p: {
              marginBottom: 16,
              fontFamily: "bangla_regular",
            },
            h1: { fontSize: banglaFontSize + 4, fontWeight: "bold" },
            h2: { fontSize: banglaFontSize + 2, fontWeight: "bold" },
            h3: { fontSize: banglaFontSize, fontWeight: "bold" },
          }}
        />
      </ScrollView>
    );
  };

  const FontSlider = ({ title, value, onValueChange, min, max }) => (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderTitle}>{title}</Text>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderValue}>{value.toFixed(1)}</Text>
        <View style={styles.sliderWrapper}>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => onValueChange(Math.max(min, value - 1))}
          >
            <Text style={styles.sliderButtonText}>-</Text>
          </TouchableOpacity>

          <View style={styles.sliderTrack}>
            <View
              style={[
                styles.sliderProgress,
                { width: `${((value - min) / (max - min)) * 100}%` },
              ]}
            />
          </View>

          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => onValueChange(Math.min(max, value + 1))}
          >
            <Text style={styles.sliderButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title:
            `${catName} (${
              parsedTopics[currentPageIndex]?.title || subCatName
            })` || "বিস্তারিত",
          headerRight: () => (
            <TouchableOpacity onPress={openModal} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={20} color="#037764" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Content */}
      {renderContent()}

      {/* Page Indicators */}
      <View style={styles.pageIndicatorContainer}>
        <Text style={styles.pageIndicatorText}>
          পৃষ্ঠা {(currentPageIndex + 1).toLocaleString("bn-BD")} /{" "}
          {parsedTopics.length.toLocaleString("bn-BD")}
        </Text>
        <View style={styles.pageButtons}>
          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPageIndex === 0 && styles.disabledButton,
            ]}
            onPress={() => handlePageChange(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
          >
            <Text style={styles.pageButtonText}>← পূর্ববর্তী</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPageIndex === parsedTopics.length - 1 &&
                styles.disabledButton,
            ]}
            onPress={() =>
              handlePageChange(
                Math.min(parsedTopics.length - 1, currentPageIndex + 1)
              )
            }
            disabled={currentPageIndex === parsedTopics.length - 1}
          >
            <Text style={styles.pageButtonText}>পরবর্তী →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: modalTranslateY }] },
            ]}
            {...panResponder.panHandlers}
          >
            {/* Drag handle */}
            <View style={styles.dragHandle} />

            <Text style={styles.modalTitle}>ফন্ট সেটিংস</Text>
            <View style={styles.divider} />

            <View style={styles.modalBody}>
              <FontSlider
                title="বাংলা ফন্ট সাইজ"
                value={banglaFontSize}
                onValueChange={updateBanglaFontSize}
                min={12}
                max={24}
              />
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>বন্ধ করুন</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  settingsButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pageIndicatorContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  pageIndicatorText: {
    textAlign: "center",
    marginBottom: 8,
    color: "#666",
    fontFamily: "bangla_regular",
  },
  pageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pageButton: {
    backgroundColor: "#037764",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  pageButtonText: {
    color: "#fff",
    fontFamily: "bangla_regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 16,
  },
  modalBody: {
    paddingHorizontal: 16,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderValue: {
    fontSize: 14,
    color: "#666",
    minWidth: 40,
  },
  sliderWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#138d75",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
    borderRadius: 2,
    overflow: "hidden",
  },
  sliderProgress: {
    height: "100%",
    backgroundColor: "#138d75",
  },
  closeButton: {
    backgroundColor: "#138d75",
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
