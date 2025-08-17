import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

export default function Muhasaba() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>মুহাসাবা কি?</Text>
        
        <View style={styles.card}>
          <Text style={styles.text}>
            নিজের গোনাহ-অপরাধ এবং দোষ-ত্রুটি হিসাব করাকে মুহাসাবা বলে।
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.quoteText}>
            অনন্তর যে অবাধ্য হবে এবং দুনিয়ার জীবনকে প্রাধান্য দিবে তার ঠিকানা হবে জাহান্নাম। আর যে তার প্রভুর সামনে দাঁড়ানোর ভয় করবে এবং মনকে প্রবৃত্তি বা খেয়াল-খুশীর অনুসরণ থেকে বিরত রাখবে তার ঠিকানা হবে জান্নাত। (নাযিয়াত ৩৭-৪১)।
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.quoteText}>
            বুদ্ধিমান সেই ব্যক্তি, যে তার নফসের হিসাব নেয় এবং মৃত্যুর পরবর্তী জীবনের জন্য কাজ করে; আর দুর্বল ঐ ব্যক্তি, যে নিজের নফসের কুপ্রবৃত্তির অনুসরণ করে এবং আল্লাহর কাছেও আশা-আকাঙ্খা রাখে। –(হাদিস নং- ২৪৫৯)।
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push("/pages/intro/ask_must_read")}
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 80,
    paddingTop : 60
  },
  title: {
    fontFamily: 'bangla_bold',
    fontSize: 28,
    color: '#037764',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontFamily: 'bangla_regular',
    fontSize: 16,
    lineHeight: 28,
    color: '#333',
  },
  quoteText: {
    fontFamily: 'bangla_regular',
    lineHeight: 26,
    color: '#555',
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
    fontSize: 16,
    color: 'white',
    marginRight: 10,
  },
});