import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AskMustRead() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <FontAwesome5 name="book-reader" size={32} color="#037764" />
          <Text style={styles.title}>প্রয়োজনীয় নির্দেশিকা</Text>
          <Text style={styles.subtitle}>অ্যাপটি ব্যবহার শুরু করার আগে এই তথ্যগুলো পড়ুন</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={22} color="#037764" />
            <Text style={styles.cardTitle}>গুরুত্বপূর্ণ তথ্য</Text>
          </View>
          <Text style={styles.cardText}>
            এই অ্যাপটি আপনার দৈনন্দিন ইবাদত, মুহাসাবা এবং আত্মউন্নয়নের জন্য একটি সহায়ক টুল। সর্বোচ্চ সুফল পেতে নিয়মিত ব্যবহার করুন।
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="privacy-tip" size={22} color="#037764" />
            <Text style={styles.cardTitle}>গোপনীয়তা নীতি</Text>
          </View>
          <Text style={styles.cardText}>
            আপনার সমস্ত ডাটা শুধুমাত্র আপনার ডিভাইসে সংরক্ষিত হয়। আমরা কোনো তথ্য সংগ্রহ বা শেয়ার করি না।
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="star" size={22} color="#037764" />
            <Text style={styles.cardTitle}>সেরা ব্যবহার</Text>
          </View>
          <Text style={styles.cardText}>
            প্রতিদিন সকালে বা রাতে নির্দিষ্ট সময় বের করে মুহাসাবা করুন। নিয়মিত ব্যবহারে আপনি আধ্যাত্মিক উন্নতি অনুভব করবেন।
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push("/pages/intro/ask_age")}
        >
          <Text style={styles.buttonText}>এগিয়ে যান</Text>
          <MaterialIcons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 30
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontFamily: 'bangla_bold',
    fontSize: 24,
    color: '#037764',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'bangla_regular',
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: 'bangla_bold',
    fontSize: 16,
    color: '#037764',
    marginLeft: 10,
  },
  cardText: {
    fontFamily: 'bangla_regular',
    lineHeight: 24,
    color: '#495057',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#037764',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: 'bangla_medium',
    fontSize: 18,
    color: 'white',
    marginRight: 10,
  },
});