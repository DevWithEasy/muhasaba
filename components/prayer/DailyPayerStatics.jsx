import { StyleSheet, Text, View } from "react-native";
import { CircularProgress } from "react-native-circular-progress";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

export default function DailyPayerStatics({ user, salah }) {
  const createdAt = new Date(user.createdAt);
  const today = new Date();

  let daysSinceCreation =
    Math.floor((today - createdAt) / (1000 * 60 * 60 * 24)) + 1;
  daysSinceCreation = Math.max(0, daysSinceCreation);

  const expectedPrayers = daysSinceCreation * 5;

  let actualPrayers = 0;
  const prayerCount = {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  };

  salah.forEach((day) => {
    if (day.salat.fajr) {
      actualPrayers++;
      prayerCount.fajr++;
    }
    if (day.salat.dhuhr) {
      actualPrayers++;
      prayerCount.dhuhr++;
    }
    if (day.salat.asr) {
      actualPrayers++;
      prayerCount.asr++;
    }
    if (day.salat.maghrib) {
      actualPrayers++;
      prayerCount.maghrib++;
    }
    if (day.salat.isha) {
      actualPrayers++;
      prayerCount.isha++;
    }
  });

  return (
    <View style={styles.container}>

      {/* Overall Progress */}
      <View style={styles.section}>
        <Text style={styles.stats}>
          অ্যাকাউন্ট খোলার পর থেকে {convertToBanglaNumbers(daysSinceCreation)} দিন হয়েছে
        </Text>
        <Text style={styles.stats}>
          পড়ার কথা: {convertToBanglaNumbers(expectedPrayers)} ওয়াক্ত | পড়েছেন: {convertToBanglaNumbers(actualPrayers)}{" "}
          ওয়াক্ত
        </Text>

        <View style={styles.prayerProgressContainer}>
          <View style={styles.prayerProgress}>
            <Text style={styles.prayerName}>মোট সালাত</Text>
            <View style={styles.circularProgressSmall}>
              <CircularProgress
                size={70}
                width={8}
                fill={
                  daysSinceCreation > 0
                    ? (actualPrayers / expectedPrayers) * 100
                    : 0
                }
                tintColor="#037764"
                backgroundColor="#ecf0f1"
                rotation={0}
                lineCap="round"
              >
                {() => (
                  <Text style={styles.circularProgressSmallText}>
                    {convertToBanglaNumbers(actualPrayers)}/
                    {convertToBanglaNumbers(expectedPrayers)}
                  </Text>
                )}
              </CircularProgress>
            </View>
          </View>

          {Object.entries(prayerCount).map(([prayer, count]) => (
            <View key={prayer} style={styles.prayerProgress}>
              <Text style={styles.prayerName}>
                {prayer === "fajr"
                  ? "ফজর"
                  : prayer === "dhuhr"
                  ? "যোহর"
                  : prayer === "asr"
                  ? "আসর"
                  : prayer === "maghrib"
                  ? "মাগরিব"
                  : "ইশা"}
              </Text>
              <View style={styles.circularProgressSmall}>
                <CircularProgress
                  size={70}
                  width={8}
                  fill={
                    daysSinceCreation > 0
                      ? (count / daysSinceCreation) * 100
                      : 0
                  }
                  tintColor="#037764"
                  backgroundColor="#ecf0f1"
                  rotation={0}
                  lineCap="round"
                >
                  {() => (
                    <Text style={styles.circularProgressSmallText}>
                      {convertToBanglaNumbers(count)}/
                      {convertToBanglaNumbers(daysSinceCreation)}
                    </Text>
                  )}
                </CircularProgress>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontFamily: "bangla_bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#2c3e50",
  },
  section: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "bangla_semibold",
    marginBottom: 10,
    color: "#34495e",
    textAlign: "center",
  },
  stats: {
    fontFamily: "bangla_regular",
    marginBottom: 8,
    color: "#7f8c8d",
    textAlign: "center",
  },
  circularProgressContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  circularProgressText: {
    fontFamily: "bangla_semibold",
    color: "#2c3e50",
  },
  prayerProgressContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  prayerProgress: {
    alignItems: "center",
    width: "30%",
    marginBottom: 15,
  },
  prayerName: {
    fontSize: 14,
    fontFamily: "bangla_medium",
    color: "#2c3e50",
    marginBottom: 5,
  },
  circularProgressSmall: {
    alignItems: "center",
  },
  circularProgressSmallText: {
    fontSize: 12,
    fontFamily: "bangla_bold",
    color: "#2c3e50",
  },
  todayContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  todayProgress: {
    alignItems: "center",
  },
  todayLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#7f8c8d",
  }
});