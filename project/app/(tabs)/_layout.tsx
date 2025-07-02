import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Chrome as Home, Utensils, Plus, Calendar, Settings } from 'lucide-react-native';
import { triggerHapticFeedback } from '@/utils/haptics';

export default function TabLayout() {
  const handleTabPress = () => {
    triggerHapticFeedback.selection();
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#333333',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 12,
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <Home size={28} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <Utensils size={28} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <Plus size={28} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={28} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <Settings size={28} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tabs>
  );
}