import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const CustomHeaderTitle: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tranobongo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CustomHeaderTitle;
