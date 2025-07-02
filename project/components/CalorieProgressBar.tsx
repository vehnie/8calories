import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CalorieProgressBarProps {
  current: number;
  goal: number;
}

export function CalorieProgressBar({ current, goal }: CalorieProgressBarProps) {
  const progress = Math.min(current / goal, 1);

  return (
    <View style={styles.container}>
      <View style={styles.progressBackground}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progress * 100}%` }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
});