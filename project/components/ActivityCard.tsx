import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Flame } from 'lucide-react-native';
import { triggerHapticFeedback } from '@/utils/haptics';

interface ActivityData {
  id: string;
  name: string;
  duration: string;
  calories: number;
  icon: string;
}

interface ActivityCardProps {
  activity: ActivityData;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const handlePress = () => {
    triggerHapticFeedback.selection();
    // Handle activity card press
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{activity.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{activity.name}</Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Clock size={14} color="#6b7280" />
            <Text style={styles.detailText}>{activity.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Flame size={14} color="#f97316" />
            <Text style={styles.detailText}>{activity.calories} cal</Text>
          </View>
        </View>
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
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
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});