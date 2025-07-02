import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MacroProgressBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit: string;
}

export function MacroProgressBar({
  label,
  current,
  goal,
  color,
  unit,
}: MacroProgressBarProps) {
  const progress = Math.min(current / goal, 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {current}{unit} / {goal}{unit}
        </Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  values: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    minWidth: 40,
    textAlign: 'right',
  },
});