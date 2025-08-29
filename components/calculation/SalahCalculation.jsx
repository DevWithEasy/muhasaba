import { View, Text, StyleSheet } from "react-native";
import React from "react";
import daysUntilBirthday from "../../utils/daysUntilBirthday";

export default function SalahCalculation({ user, salah }) {
  // Check if data is available
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>ব্যবহারকারীর তথ্য লোড হচ্ছে...</Text>
      </View>
    );
  }

  const fardRakats = {
    fajr: 2,
    dhuhr: 4,
    asr: 4,
    maghrib: 3,
    isha: 4,
  };

  const nafilRakats = {
    tahajjud: 2,
    nafil: 2,
  };

  // Calculate prayer data with safety checks
  const reduceDays = 7 * 365;
  const totalDays = daysUntilBirthday(user?.birthDate || new Date());
  const requiredPrayerDays = Math.max(0, totalDays - reduceDays);
  const salahDaysBeforeAppInstall = Number(user?.prayerYears || 0) * 365;

  // Calculate required rakats for fard prayers
  const requiredFardRakatCalculation = Object.keys(fardRakats).map((prayer) => ({
    name: prayer,
    total: requiredPrayerDays * fardRakats[prayer],
    type: "fard",
  }));

  // Calculate rakats prayed before app install (only fard)
  const beforeAppInstallRakatCalculation = Object.keys(fardRakats).map(
    (prayer) => ({
      name: prayer,
      total: salahDaysBeforeAppInstall * fardRakats[prayer],
      type: "fard",
    })
  );

  // Check if salah data is empty or not available
  const hasSalahData = salah && Array.isArray(salah) && salah.length > 0;

  // Calculate rakats prayed after app install (both fard and nafil)
  const totalFardRakatArray = Object.keys(fardRakats).map((prayer) => ({
    name: prayer,
    total: hasSalahData 
      ? salah.reduce((sum, day) => sum + (day?.rakaat?.[prayer] || 0), 0)
      : 0,
    type: "fard",
  }));

  const totalNafilRakatArray = Object.keys(nafilRakats).map((prayer) => ({
    name: prayer,
    total: hasSalahData
      ? salah.reduce((sum, day) => sum + (day?.rakaat?.[prayer] || 0), 0)
      : 0,
    type: "nafil",
  }));

  // Combine calculations for fard prayers
  const combinedFardRakatArray = Object.keys(fardRakats).map((prayer) => {
    const requiredTotal = requiredFardRakatCalculation.find(
      (item) => item.name === prayer
    )?.total || 0;

    const afterInstallTotal =
      beforeAppInstallRakatCalculation.find((item) => item.name === prayer)
        ?.total || 0;

    const actualTotal =
      totalFardRakatArray.find((item) => item.name === prayer)?.total || 0;

    const total = afterInstallTotal + actualTotal;

    return {
      name: prayer,
      requiredTotal: requiredTotal || 0,
      prayeredTotal: total || 0,
      diff: (requiredTotal || 0) - (total || 0),
      percentage: requiredTotal > 0 ? Math.round((total / requiredTotal) * 100) : 0,
      type: "fard",
    };
  });

  // Add nafil prayers (no required amount, just show what was prayed)
  const nafilPrayersArray = Object.keys(nafilRakats).map((prayer) => {
    const prayeredTotal = totalNafilRakatArray.find(
      (item) => item.name === prayer
    )?.total || 0;

    return {
      name: prayer,
      requiredTotal: 0, // No requirement for nafil
      prayeredTotal: prayeredTotal || 0,
      diff: 0, // No deficit for nafil
      percentage: 0, // Not applicable
      type: "nafil",
    };
  });

  // Calculate totals - FARD ONLY for required and diff
  const fardTotals = combinedFardRakatArray.reduce(
    (acc, item) => {
      acc.requiredTotal += item.requiredTotal || 0;
      acc.prayeredTotal += item.prayeredTotal || 0;
      acc.diff += item.diff || 0;
      return acc;
    },
    { requiredTotal: 0, prayeredTotal: 0, diff: 0, name: "fardTotal", type: "total" }
  );

  // Calculate nafil total
  const nafilTotals = nafilPrayersArray.reduce(
    (acc, item) => {
      acc.prayeredTotal += item.prayeredTotal || 0;
      return acc;
    },
    { prayeredTotal: 0, name: "nafilTotal", type: "total" }
  );

  // Calculate GRAND TOTAL - nafil added to prayeredTotal but NOT subtracted from diff
  const grandTotal = {
    name: "grandTotal",
    requiredTotal: fardTotals.requiredTotal || 0,
    prayeredTotal: (fardTotals.prayeredTotal || 0) + (nafilTotals.prayeredTotal || 0),
    // diff: fardTotals.diff || 0, 
    diff: (fardTotals.requiredTotal || 0)-((fardTotals.prayeredTotal || 0) + (nafilTotals.prayeredTotal || 0)), 
    type: "total",
  };

  const tableData = [...combinedFardRakatArray, ...nafilPrayersArray, fardTotals, nafilTotals, grandTotal];

  // Bengali translations
  const bengaliTranslations = {
    fajr: "ফজর",
    dhuhr: "যোহর",
    asr: "আসর",
    maghrib: "মাগরিব",
    isha: "ইশা",
    tahajjud: "তাহাজ্জুদ",
    nafil: "নফল",
    fardTotal: "ফরজ মোট",
    nafilTotal: "নফল মোট",
    grandTotal: "সর্বমোট",
    required: "প্রয়োজন",
    prayered: "পড়া হয়েছে",
    remaining: "বাকি",
    header: "নামাজের হিসাব",
    fard: "फরজ",
  };

  // Get the worst performing fard prayer (highest remaining)
  const fardPrayersWithDeficit = combinedFardRakatArray.filter(prayer => prayer.diff > 0);
  const worstPrayer = fardPrayersWithDeficit.length > 0 
    ? [...fardPrayersWithDeficit].sort((a, b) => b.diff - a.diff)[0] 
    : null;

  const fardPrayersWithSurplus = combinedFardRakatArray.filter(prayer => prayer.diff <= 0);
  const bestPrayer = fardPrayersWithSurplus.length > 0 
    ? [...fardPrayersWithSurplus].sort((a, b) => a.diff - b.diff)[0] 
    : null;

  // Alert messages
  const getAlertMessage = () => {
    if (fardTotals.diff > 500) {
      return {
        type: "danger",
        message: "সতর্কতা! আপনার ফরজ নামাজের ঘাটতি অনেক বেশি। নিয়মিত নামাজ পড়ার চেষ্টা করুন।",
      };
    } else if (fardTotals.diff > 100) {
      return {
        type: "warning",
        message: "আপনার ফরজ নামাজের ঘাটতি আছে। আরো নিয়মিত হওয়ার চেষ্টা করুন।",
      };
    } else if (fardTotals.diff > 0) {
      return {
        type: "info",
        message: "আপনি ভালো করছেন, তবে আরো উন্নতি সম্ভব।",
      };
    } else {
      return {
        type: "success",
        message: "মাশাআল্লাহ! আপনি নিয়মিত ফরজ নামাজ পড়ছেন। এই ধারা বজায় রাখুন।",
      };
    }
  };

  const alert = getAlertMessage();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{bengaliTranslations.header}</Text>

      {/* Alert Box */}
      <View style={[styles.alertBox, styles[`alert${alert.type}`]]}>
        <Text style={styles.alertText}>{alert.message}</Text>
        
        {worstPrayer && worstPrayer.diff > 0 && (
          <Text style={styles.alertDetailText}>
            সর্বাধিক বাকি: {bengaliTranslations[worstPrayer.name]} ({worstPrayer.diff?.toLocaleString("bn-BD") || 0} রাকাত)
          </Text>
        )}
        
        {bestPrayer && bestPrayer.diff <= 0 && (
          <Text style={styles.alertDetailText}>
            সবচেয়ে ভালো: {bengaliTranslations[bestPrayer.name]} ({Math.abs(bestPrayer.diff || 0)?.toLocaleString("bn-BD") || 0} রাকাত বেশি)
          </Text>
        )}

        {nafilTotals.prayeredTotal > 0 && (
          <Text style={styles.alertDetailText}>
            নফল নামাজ: {nafilTotals.prayeredTotal?.toLocaleString("bn-BD") || 0} রাকাত (অতিরিক্ত সওয়াব)
          </Text>
        )}

        {!hasSalahData && (
          <Text style={styles.alertDetailText}>
            আপনি এখনো অ্যাপে কোন নামাজের রেকর্ড যোগ করেননি। নামাজ ট্র্যাকার থেকে রেকর্ড যোগ করুন।
          </Text>
        )}
      </View>

      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <Text style={[styles.cell, styles.headerCell, styles.firstColumn]}>
            নামাজ
          </Text>
          <Text style={[styles.cell, styles.headerCell]}>
            {bengaliTranslations.required}
          </Text>
          <Text style={[styles.cell, styles.headerCell]}>
            {bengaliTranslations.prayered}
          </Text>
          <Text style={[styles.cell, styles.headerCell]}>
            {bengaliTranslations.remaining}
          </Text>
        </View>

        {/* Table Rows */}
        {tableData.map((row, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              row.type === "total" && styles.totalRow,
              row.type === "nafil" && styles.nafilRow,
            ]}
          >
            <Text
              style={[
                styles.cell,
                styles.firstColumn,
                row.type === "total" && styles.boldText,
                row.type === "nafil" && styles.nafilText,
                styles.prayerName,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {bengaliTranslations[row.name] || row.name}
            </Text>
            <Text style={[styles.cell, styles.numberCell, row.type === "nafil" && styles.nafilText]}>
              {row.requiredTotal > 0 ? (row.requiredTotal || 0).toLocaleString("bn-BD") : "-"}
            </Text>
            <Text style={[styles.cell, styles.numberCell, row.type === "nafil" && styles.nafilText]}>
              {(row.prayeredTotal || 0).toLocaleString("bn-BD")}
            </Text>
            <Text
              style={[
                styles.cell,
                styles.numberCell,
                row.diff > 0 ? styles.negativeDiff : styles.positiveDiff,
                row.type === "nafil" && styles.nafilText,
              ]}
            >
              {row.diff !== 0 ? (row.diff || 0).toLocaleString("bn-BD") : "-"}
            </Text>
          </View>
        ))}
      </View>

      {/* Motivational Message */}
      <View style={styles.tipBox}>
        <Text style={styles.tipText}>
          {worstPrayer && worstPrayer.diff > 0 ? 
            `প্রতিদিন অতিরিক্ত ${Math.ceil((grandTotal.diff || 0)/30).toLocaleString('bn-BD')} রাকাত নামাজ পড়লে ১ মাসে ঘাটতি পূরণ হবে` :
            "আপনি সকল ফরজ নামাজ নিয়মিত পড়ছেন, মাশাআল্লাহ!"
          }
        </Text>
        {nafilTotals.prayeredTotal > 0 && (
          <Text style={styles.tipText}>
            আপনি {(nafilTotals.prayeredTotal || 0).toLocaleString("bn-BD")} রাকাত নফল নামাজ পড়েছেন, যা অতিরিক্ত সওয়াবের কারণ হবে।
          </Text>
        )}
        {!hasSalahData && (
          <Text style={styles.tipText}>
            নামাজ ট্র্যাকারে গিয়ে আজকের নামাজের রেকর্ড যোগ করে হিসাব শুরু করুন।
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  errorText: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#e53e3e",
    textAlign: "center",
    marginTop: 20,
  },
  header: {
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
    color: "#333",
    fontFamily: "bangla_bold",
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    minHeight: 45,
  },
  totalRow: {
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#aaa",
  },
  nafilRow: {
    backgroundColor: "#f0f8ff",
  },
  cell: {
    flex: 1,
    padding: 8,
    textAlign: "center",
    fontFamily: "bangla_regular",
    justifyContent: "center",
  },
  prayerName: {
    fontSize: 12,
  },
  headerCell: {
    fontFamily: "bangla_bold",
    backgroundColor: "#f0f0f0",
    color: "#333",
    fontSize: 12,
  },
  firstColumn: {
    flex: 0.7,
    textAlign: "left",
  },
  numberCell: {
    fontFamily: "bangla_regular",
    fontSize: 12,
  },
  boldText: {
    fontFamily: "bangla_bold",
  },
  nafilText: {
    color: "#1e88e5",
  },
  positiveDiff: {
    color: "#4CAF50",
  },
  negativeDiff: {
    color: "#F44336",
  },
  alertBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  alertdanger: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 3,
    borderLeftColor: "#F44336",
  },
  alertwarning: {
    backgroundColor: "#FFF3E0",
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },
  alertinfo: {
    backgroundColor: "#E3F2FD",
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
  },
  alertsuccess: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  alertText: {
    fontFamily: "bangla_bold",
    fontSize: 14,
    marginBottom: 5,
  },
  alertDetailText: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    marginTop: 3,
  },
  tipBox: {
    backgroundColor: "#E1F5FE",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#03A9F4",
  },
  tipText: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#01579B",
    marginBottom: 5,
    lineHeight: 18,
  },
});