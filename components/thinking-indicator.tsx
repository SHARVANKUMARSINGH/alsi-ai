import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export function ThinkingIndicator() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [progress]);

  const dotStyle = (index: number) => ({
    opacity: progress.interpolate({
      inputRange: [0, 0.25 + index * 0.1, 0.5 + index * 0.1, 1],
      outputRange: [0.28, 1, 0.28, 0.28],
      extrapolate: "clamp" as const,
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 0.25 + index * 0.1, 0.5 + index * 0.1, 1],
          outputRange: [0, -3, 0, 0],
          extrapolate: "clamp" as const,
        }),
      },
    ],
  });

  return (
    <View style={styles.container} accessibilityLabel="ALSI Ai is thinking">
      <View style={styles.dotGroup}>
        {[0, 1, 2].map((index) => (
          <Animated.View key={index} style={[styles.dot, dotStyle(index)]} />
        ))}
      </View>
      <Text style={styles.label}>Thinking...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFF0EE",
    borderRadius: 20,
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  dotGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    height: 15,
  },
  dot: {
    backgroundColor: "#FF5A4F",
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  label: {
    color: "#A13E37",
    fontSize: 13,
    fontWeight: "700",
  },
});
