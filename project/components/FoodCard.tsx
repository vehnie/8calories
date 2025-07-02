import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { triggerHapticFeedback } from '@/utils/haptics';

interface FoodData {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  image: string;
}

interface FoodCardProps {
  food: FoodData;
}

export function FoodCard({ food }: FoodCardProps) {
  const handlePress = () => {
    triggerHapticFeedback.selection();
    // Handle food card press
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: food.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{food.name}</Text>
        <Text style={styles.quantity}>{food.quantity}</Text>
      </View>
      <View style={styles.caloriesContainer}>
        <Text style={styles.calories}>{food.calories}</Text>
        <Text style={styles.caloriesLabel}>cal</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#2a2a2a',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 14,
    color: '#9ca3af',
  },
  caloriesContainer: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
});