// app/(tabs)/_layout.js
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TodoLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontFamily: "bangla_bold",
        },
        tabBarActiveTintColor: "#037764",
        tabBarLabelStyle: {
          fontFamily: "bangla_bold",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "কর্ম তালিকা",
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_bold", color }}>
              কর্ম তালিকা
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ongoing"
        options={{
          title: "চলমান কাজ",
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_bold", color }}>চলমান কাজ</Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hourglass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="complete"
        options={{
          title: "সম্পন্ন কাজ",
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_bold", color }}>
              সম্পন্ন কাজ
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}