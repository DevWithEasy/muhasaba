import { ScrollView, StyleSheet,View } from "react-native";
import PrayerTimeView from "../../components/PrayerTimeView";
import Calculation from "../../components/calculation/Calculation";

export default function Index() {
  return (
    <ScrollView style={styles.container}>
      <View style={{paddingBottom : 40}}>
        <PrayerTimeView />
        <Calculation />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 10,
  },
});
