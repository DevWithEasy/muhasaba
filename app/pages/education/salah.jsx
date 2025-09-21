import * as Notifications from "expo-notifications";
import { Button, Text, View } from "react-native";

export default function Salah() {
  return (
    <View>
      <Text>Salah</Text>
      <Button
        title="Click"
        onPress={() => {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Look at that notification",
              body: "I'm so proud of myself!",
              sound: "notification_sound.mp3",
            },
            trigger: {
              seconds: 5,
            },
          });
        }}
      />
    </View>
  );
}