import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { triggerHapticFeedback } from '@/utils/haptics';

interface FoodItem {
  id: string;
  name: string;
  weight: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  icon: string;
}

interface FoodItemCardProps {
  item: FoodItem;
  onPress?: (item: FoodItem) => void;
  units?: 'Metric' | 'Imperial';
}

export function FoodItemCard({ item, onPress, units = 'Metric' }: FoodItemCardProps) {
  const handlePress = () => {
    triggerHapticFeedback.selection();
    onPress?.(item);
  };

  // Convert nutritional values to appropriate units for display
  const getDisplayValue = (value: number) => {
    if (units === 'Imperial') {
      return (Math.round((value / 28.3495) * 10) / 10).toFixed(1);
    }
    return value.toFixed(1);
  };

  const unitLabel = units === 'Imperial' ? 'oz' : 'g';

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>
          Calories: {item.calories} kcal | Protein: {getDisplayValue(item.protein)}{unitLabel} | Carbs: {getDisplayValue(item.carbs)}{unitLabel} | Fat: {getDisplayValue(item.fat)}{unitLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    marginBottom: 8,
    borderRadius: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  details: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 16,
  },
});