import { StyleSheet, Text, View } from "react-native";

export default function JammatWarning({ salah }) {

  const lastThreeDays = salah.slice(0, 3);
  let fajrJamaat = 0;
  let ishaJamaat = 0;

  lastThreeDays.forEach((day) => {
    if (day.jamaat.fajr) fajrJamaat++;
    if (day.jamaat.isha) ishaJamaat++;
  });

  const showFajrWarning = fajrJamaat < 3;
  const showIshaWarning = ishaJamaat < 3;

  const getWarningText = () => {
    if (showFajrWarning && showIshaWarning) {
      return "⚠️ সতর্কতা: গত ৩ দিনে আপনি ফজর ও ইশার জামাতে উপস্থিত হননি";
    } else if (showFajrWarning) {
      return "⚠️ সতর্কতা: গত ৩ দিনে আপনি ফজর জামাতে উপস্থিত হননি";
    } else {
      return "⚠️ সতর্কতা: গত ৩ দিনে আপনি ইশা জামাতে উপস্থিত হননি";
    }
  };

  return (
    <View style={styles.container}>
      {(showFajrWarning || showIshaWarning) && (
        <View style={styles.warningSection}>
          <Text style={styles.warningText}>{getWarningText()}</Text>
          <Text style={styles.warningSubtext}>
            • রাসূল ﷺ বলেছেন, ফজর ও এশার জামাত না পড়া মুনাফিকদের বৈশিষ্ট্য।
            কয়েকদিন ধরে আপনি জামাতে আসছেন না। নিজের আমল ঠিক করুন। আল্লাহর কাছে
            তাওবা করুন এবং নিয়মিত জামাতে যোগ দিন।
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  warningSection: {
    backgroundColor: "#fff6daff",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#fdcb6e",
    marginVertical : 10,
  },
  warningText: {
    fontFamily: "bangla_bold",
    color: "#d35400",
    marginBottom: 5,
  },
  warningSubtext: {
    fontSize: 12,
    color: "#b35605ff",
    fontFamily: "bangla_regular",
    textAlign: "justify",
  },
});