import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'

export default function Education() {
  return (
    <ScrollView style={styles.container}>
      <Text>Education</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
})