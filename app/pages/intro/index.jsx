import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={styles.title}>মুহাসাবা</Text>
        <Text
          style={[
            {
              fontFamily: "bangla_semibold",
              fontSize: 16,
              textAlign: "center",
              paddingHorizontal: 20,
            },
          ]}
        >
          &quot;হে মুমিনগণ! তোমরা আল্লাহকে ভয় করো। আর প্রত্যেক ব্যক্তির উচিত
          আগামীকালের (আখিরাতের) জন্য সে কী প্রেরণ করেছে, তা চিন্তা করা।&quot;
          {"\n"}— সূরা হাশর, আয়াত ১৮
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push("/pages/intro/muhasaba")}
        >
          <MaterialIcons name="fiber-new" size={24} color="white" />
          <Text style={styles.buttonText}>নতুন করে চালু করুন</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push("/pages/backup/restore")}
        >
          <MaterialIcons name="restore" size={24} color="#037764" />
          <Text style={[styles.buttonText, { color: "#037764" }]}>
            পুরাতন ডাটা রিস্টোর করুন
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    fontFamily: "bangla_bold",
    fontSize: 45,
    color: "#037764",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "bangla_semibold",
    fontSize: 16,
    color: "#037764",
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: "#037764",
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#037764",
  },
  buttonText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    marginLeft: 12,
    color: "white",
  },
});
