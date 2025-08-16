import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import convertToBanglaNumbers from "../../utils/convertToBanglaNumber";

export default function PrayerDetailItem({ 
  label, 
  rakaat, 
  isJamaat, 
  onEdit, 
  onToggleJamaat 
}) {
  return (
    <View style={styles.prayerDetailItem}>
      <View style={styles.detailLeft}>
        <Text style={styles.detailText}>
          {label}: {convertToBanglaNumbers(rakaat)} রাকাত
        </Text>
      </View>
      <View style={styles.detailRight}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={18} color="#037764" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.jamaatButton,
            isJamaat && styles.jamaatActive
          ]}
          onPress={onToggleJamaat}
        >
          <Text style={[
            styles.jamaatText,
            isJamaat && styles.jamaatActiveText
          ]}>
            জামাত
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  prayerDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  detailLeft: {
    flex: 1,
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: 'bangla_medium',
    color: '#334155',
  },
  editButton: {
    padding: 8,
    marginRight: 10,
  },
  jamaatButton: {
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  jamaatActive: {
    backgroundColor: '#037764',
    borderColor: '#037764',
  },
  jamaatText: {
    fontFamily: 'bangla_medium',
    fontSize: 12,
    color: '#64748b',
  },
  jamaatActiveText: {
    color: 'white',
  }
};