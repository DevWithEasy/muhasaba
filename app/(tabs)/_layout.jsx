// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign : 'center',
        headerTitleStyle : {
            fontFamily : 'bangla_bold',
            // color : '#037764ff'
        },
        tabBarActiveTintColor: "#037764ff",
        tabBarLabelStyle: {
          fontFamily: "bangla_bold",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title : 'মুহাসাবা',
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_bold", color }}>মুহাসাবা</Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title : "আমার দৈনন্দিন কর্ম সমূহ",
          tabBarLabel: ({ color }) => (
            <Text style={{ fontFamily: "bangla_bold", color }}>কর্ম সমূহ</Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
