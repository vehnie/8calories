import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { X, Search, Clock, Flame } from 'lucide-react-native';
import { triggerHapticFeedback } from '@/utils/haptics';

interface AddActivityModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ActivityOption {
  id: string;
  name: string;
  icon: string;
  caloriesPerMinute: number;
  category: string;
}

export function AddActivityModal({ visible, onClose }: AddActivityModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [duration, setDuration] = useState('30');

  const activityOptions: ActivityOption[] = [
    { id: '1', name: 'Running', icon: '🏃‍♂️', caloriesPerMinute: 12, category: 'Cardio' },
    { id: '2', name: 'Cycling', icon: '🚴‍♂️', caloriesPerMinute: 8, category: 'Cardio' },
    { id: '3', name: 'Swimming', icon: '🏊‍♂️', caloriesPerMinute: 10, category: 'Cardio' },
    { id: '4', name: 'Weight Training', icon: '🏋️‍♂️', caloriesPerMinute: 6, category: 'Strength' },
    { id: '5', name: 'Yoga', icon: '🧘‍♀️', caloriesPerMinute: 3, category: 'Flexibility' },
    { id: '6', name: 'Walking', icon: '🚶‍♂️', caloriesPerMinute: 4, category: 'Cardio' },
    { id: '7', name: 'Dancing', icon: '💃', caloriesPerMinute: 7, category: 'Cardio' },
    { id: '8', name: 'Basketball', icon: '⛹️‍♂️', caloriesPerMinute: 9, category: 'Sports' },
  ];

  const filteredActivities = activityOptions.filter(activity =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    triggerHapticFeedback.light();
    onClose();
  };

  const handleAddActivity = (activity: ActivityOption) => {
    triggerHapticFeedback.success();
    // Add activity logic here
    console.log(`Adding ${activity.name} for ${duration} minutes`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Activity</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Duration Input */}
        <View style={styles.durationContainer}>
          <Text style={styles.durationLabel}>Duration (minutes)</Text>
          <View style={styles.durationInputContainer}>
            <Clock size={20} color="#22c55e" />
            <TextInput
              style={styles.durationInput}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor="#6b7280"
            />
          </View>
        </View>

        {/* Activities List */}
        <ScrollView style={styles.activitiesList} showsVerticalScrollIndicator={false}>
          {filteredActivities.map((activity) => {
            const estimatedCalories = activity.caloriesPerMinute * parseInt(duration || '0');
            return (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityItem}
                onPress={() => handleAddActivity(activity)}
              >
                <View style={styles.activityIcon}>
                  <Text style={styles.activityEmoji}>{activity.icon}</Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityCategory}>{activity.category}</Text>
                </View>
                <View style={styles.activityStats}>
                  <View style={styles.calorieInfo}>
                    <Flame size={16} color="#f97316" />
                    <Text style={styles.calorieText}>{estimatedCalories} cal</Text>
                  </View>
                  <Text style={styles.calorieRate}>
                    {activity.caloriesPerMinute} cal/min
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  durationContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  durationInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  activitiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  activityCategory: {
    fontSize: 14,
    color: '#9ca3af',
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  calorieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  calorieText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f97316',
    marginLeft: 4,
  },
  calorieRate: {
    fontSize: 12,
    color: '#6b7280',
  },
});