import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EmptyState = ({icon,title,subTitle}) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={icon}
        size={40} 
        color="#037764" 
        style={styles.icon}
      />
      {title &&<Text style={styles.emptyText}>{title}</Text>}
      {subTitle && <Text style={styles.subText}>{subTitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  icon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    fontFamily: "bangla_bold",
    color: "#037764",
    textAlign: "center",
    marginBottom: 8,
  },
  subText: {
    fontFamily: "bangla_regular",
    color: "#6c757d",
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 24,
  },
});

export default EmptyState;