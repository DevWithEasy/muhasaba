// components/SwipeableCalculation.js
import { useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const SwipeableCalculation = ({ children, onSwipeLeft, onSwipeRight, enabled = true }) => {
  const swipeableRef = useRef(null);
  
  const renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50],
      outputRange: [-50, 0],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View
        style={[
          styles.swipeAction,
          styles.swipeLeftAction,
          { transform: [{ translateX: trans }] }
        ]}
      >
        <Text style={styles.swipeActionText}>আপডেট</Text>
      </Animated.View>
    );
  };

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-50, 0],
      outputRange: [0, -50],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View
        style={[
          styles.swipeAction,
          { transform: [{ translateX: trans }] }
        ]}
      >
        <Text style={styles.swipeActionText}>বিস্তারিত</Text>
      </Animated.View>
    );
  };

  if (!enabled) {
    return children;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        if (direction === 'left' && onSwipeLeft) {
          onSwipeLeft();
        } else if (direction === 'right' && onSwipeRight) {
          onSwipeRight();
        }
        setTimeout(() => swipeableRef.current?.close(), 300);
      }}
      friction={2}
      leftThreshold={30}
      rightThreshold={30}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeAction: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeActionText: {
    fontSize: 12,
    fontFamily: 'bangla_bold',
  },
});

export default SwipeableCalculation;