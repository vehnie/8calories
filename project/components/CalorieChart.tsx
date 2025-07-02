import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CalorieChartProps {
  supplied: number;
  burned: number;
  goal: number;
}

export function CalorieChart({ supplied, burned, goal }: CalorieChartProps) {
  const netCalories = supplied - burned;
  const progress = Math.min(netCalories / goal, 1);
  const circumference = 2 * Math.PI * 60;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={140} height={140} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={70}
            cy={70}
            r={60}
            stroke="#2a2a2a"
            strokeWidth={8}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={70}
            cy={70}
            r={60}
            stroke="#22c55e"
            strokeWidth={8}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
          />
        </Svg>
        <View style={styles.centerContent}>
          <Text style={styles.caloriesLeft}>{goal - netCalories}</Text>
          <Text style={styles.caloriesLabel}>left</Text>
        </View>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>Goal: {goal}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f97316' }]} />
          <Text style={styles.legendText}>Net: {netCalories}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  svg: {
    transform: [{ scaleY: -1 }],
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesLeft: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  legend: {
    flexDirection: 'row',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});