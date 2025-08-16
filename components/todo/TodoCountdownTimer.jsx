// components/todo/CountdownTimer.js
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date();
    const end = new Date(deadline);
    const difference = end - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <View style={styles.container}>
      {timeLeft.days > 0 ? (
        <Text style={styles.timerText}>
          {timeLeft.days} দিন {timeLeft.hours} ঘণ্টা
        </Text>
      ) : timeLeft.hours > 0 ? (
        <Text style={styles.timerText}>
          {timeLeft.hours} ঘণ্টা {timeLeft.minutes} মিনিট
        </Text>
      ) : (
        <Text style={[styles.timerText, styles.urgent]}>
          {timeLeft.minutes} মিনিট {timeLeft.seconds} সেকেন্ড
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 12,
    backgroundColor: '#e6f7ff',
  },
  timerText: {
    fontFamily: 'bangla_medium',
    fontSize: 12,
    color: '#1890ff',
  },
  urgent: {
    color: '#ff4d4f',
  },
});