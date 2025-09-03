import { StyleSheet, Text, View } from "react-native";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

// Main Component
export default function DailyPayerStatics({ user, salah }) {
  const validSalah = Array.isArray(salah)
    ? salah.filter((day) => day?.salat)
    : [];

  // Count valid days
  const daysSinceCreation = Math.max(validSalah.length, 1);

  // Count prayers
  const prayerCount = {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  };
  let actualPrayers = 0;

  validSalah.forEach((day) => {
    const salat = day.salat || {};
    Object.keys(prayerCount).forEach((prayer) => {
      if (salat[prayer]) {
        prayerCount[prayer]++;
        actualPrayers++;
      }
    });
  });

  const expectedPrayers = daysSinceCreation * 5;
  const completionPercentage =
    expectedPrayers > 0
      ? Math.round((actualPrayers / expectedPrayers) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {convertToBanglaNumbers(daysSinceCreation)}
              </Text>
              <Text style={styles.summaryLabel}>মোট দিন</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {convertToBanglaNumbers(expectedPrayers)}
              </Text>
              <Text style={styles.summaryLabel}>প্রত্যাশিত সালাত</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {convertToBanglaNumbers(actualPrayers)}
              </Text>
              <Text style={styles.summaryLabel}>পড়া সালাত</Text>
            </View>
          </View>

          <View style={styles.percentageRow}>
            <Text style={styles.percentageText}>
              সম্পূর্ণতা: {convertToBanglaNumbers(completionPercentage)}%
            </Text>
          </View>
        </View>

        {/* Individual Prayer Stats */}
        <View style={styles.prayerStatsContainer}>
          {Object.entries(prayerCount).map(([prayer, count]) => {
            const percentage =
              daysSinceCreation > 0
                ? Math.round((count / daysSinceCreation) * 100)
                : 0;

            return (
              <View key={prayer} style={styles.prayerRow}>
                <View style={styles.prayerInfo}>
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
                  <Text style={styles.prayerCount}>
                    {convertToBanglaNumbers(count)}/
                    {convertToBanglaNumbers(daysSinceCreation)}
                  </Text>
                </View>
                <View style={styles.prayerInfo}>
                  <View style={styles.percentageBar}>
                    <View
                      style={[
                        styles.percentageFill,
                        {
                          width: `${percentage}%`,
                          backgroundColor:
                            percentage >= 80
                              ? "#27ae60"
                              : percentage >= 50
                              ? "#f39c12"
                              : "#e74c3c",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.percentageTextSmall}>
                    {convertToBanglaNumbers(percentage)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
  },
  section: {
    padding: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
    overflow: "hidden",
  },
  summaryCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    fontFamily: "bangla_bold",
    fontSize: 20,
    color: "#037764",
  },
  summaryLabel: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
  },
  percentageRow: {
    alignItems: "center",
    marginTop: 8,
  },
  percentageText: {
    fontFamily: "bangla_medium",
    fontSize: 14,
    color: "#037764",
  },
  prayerStatsContainer: {
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  prayerRow: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    width: "48%",
  },
  prayerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    justifyContent: "space-between",
  },
  prayerName: {
    fontFamily: "bangla_medium",
    fontSize: 14,
    color: "#2c3e50",
    marginBottom: 2,
  },
  prayerCount: {
    fontFamily: "bangla_semibold",
    fontSize: 12,
    color: "#7f8c8d",
  },
  percentageBar: {
    width: 80,
    height: 6,
    backgroundColor: "#d4d4d4ff",
    borderRadius: 3,
    overflow: "hidden",
  },
  percentageFill: {
    height: "100%",
    borderRadius: 3,
  },
  percentageTextSmall: {
    fontFamily: "bangla_semibold",
    fontSize: 12,
    color: "#2c3e50",
    minWidth: 35,
    textAlign: "right",
  }
});
