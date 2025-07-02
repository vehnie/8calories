import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface MacroCircleProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  current: number;
  goal: number;
  color: string;
}

export function MacroCircle({ 
  icon, 
  label, 
  value, 
  unit, 
  current, 
  goal, 
  color 
}: MacroCircleProps) {
  const progress = Math.min(current / goal, 1);
  const circumference = 2 * Math.PI * 30;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.circleContainer}>
        <Svg width={80} height={80} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={40}
            cy={40}
            r={30}
            stroke="#333333"
            strokeWidth={6}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={40}
            cy={40}
            r={30}
            stroke={color}
            strokeWidth={6}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
        </Svg>
        <View style={styles.centerContent}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ scaleY: -1 }],
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  unit: {
    fontSize: 12,
    color: '#666666',
  },
});