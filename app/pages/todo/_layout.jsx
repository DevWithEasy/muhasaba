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
        tabBarInactiveTintColor: "#8e8e93",
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 8,
        },
        tabBarStyle: {
          height: 65,
          paddingTop: 4,
        },
        tabBarItemStyle: {
          paddingBottom: 4,
        },
        headerStyle: {
          backgroundColor: "#f8fafc",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "কর্ম তালিকা",
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ fontFamily: "bangla_medium", color, fontSize: 12 }}>
              কর্ম তালিকা
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ongoing"
        options={{
          title: "চলমান কাজ",
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_medium", color, fontSize: 12 }}>
              চলমান কাজ
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "hourglass" : "hourglass-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="complete"
        options={{
          title: "সম্পন্ন কাজ",
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_medium", color, fontSize: 12 }}>
              সম্পন্ন কাজ
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "checkmark-circle" : "checkmark-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
