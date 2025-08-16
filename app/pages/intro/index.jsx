import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

export default function Index() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/images/react-logo.png')}
        style={styles.logo}
      />
      
      <Text style={styles.title}>মুহাসাবা</Text>
      <Text style={styles.subtitle}>আত্মসমালোচনা অ্যাপে স্বাগতম</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/pages/intro/muhasaba')}
        >
          <MaterialIcons name="fiber-new" size={24} color="white" />
          <Text style={styles.buttonText}>নতুন করে চালু করুন</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/pages/backup/restore')}
        >
          <MaterialIcons name="restore" size={24} color="#037764" />
          <Text style={[styles.buttonText, {color: '#037764'}]}>পুরাতন ডাটা রিস্টোর করুন</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'bangla_bold',
    fontSize: 32,
    color: '#037764',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'bangla_medium',
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#037764',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#037764',
  },
  buttonText: {
    fontFamily: 'bangla_medium',
    fontSize: 16,
    marginLeft: 12,
    color: 'white',
  },
});