// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontFamily: "bangla_bold",
        },
        headerStyle: {
          backgroundColor: "#f8fafc",
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "মুহাসাবা",
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_medium", color, fontSize: 12 }}>
              মুহাসাবা
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "আমার দৈনন্দিন কর্ম সমূহ",
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_medium", color, fontSize: 12 }}>
              কর্ম সমূহ
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
            <Tabs.Screen
        name="education"
        options={{
          title: "ইসলামিক শিক্ষা",
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_medium", color, fontSize: 12 }}>
              শিক্ষা
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "library" : "library-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: "প্রোফাইল",
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_medium", color, fontSize: 12 }}>
              প্রোফাইল
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
