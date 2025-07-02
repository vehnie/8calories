import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Plus, Search, Utensils, BookOpen, ChefHat, Package, Apple } from 'lucide-react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { triggerHapticFeedback } from '@/utils/haptics';
import { NotificationBanner } from '@/components/NotificationBanner';
import { customFoodStorage, mealPresetStorage, profileStorage, CustomFood, MealPreset, AppData } from '@/utils/storage';

export default function DiaryScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'foods'>('presets');
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [mealPresets, setMealPresets] = useState<MealPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [appData, setAppData] = useState<AppData>({
    units: 'Metric',
    tdee: 'Mifflin-St Jeor',
  });

  // Convert nutritional values for display based on unit system
  const convertNutritionalValue = (value: string | number, isImperial: boolean, servingUnit: string) => {
    if (value === null || value === undefined) return value;
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return value;
    
    if (isImperial) {
      // Convert grams to ounces for Imperial display
      // Note: Nutritional values are typically stored in grams regardless of serving unit
      return (numValue / 28.3495).toFixed(1);
    } else {
      // In metric mode, return the original values
      return typeof value === 'string' ? value : value.toString();
    }
  };

  // Convert serving size for display based on unit system
  const convertServingSize = (servingSize: string, isImperial: boolean, servingUnit: string) => {
    if (servingUnit !== 'grams' || !isImperial) return servingSize;
    
    const numValue = parseFloat(servingSize.replace(/[^\d.]/g, ''));
    if (isNaN(numValue)) return servingSize;
    
    // Convert grams to ounces for Imperial display
    const convertedValue = (numValue / 28.3495).toFixed(1);
    return convertedValue;
  };

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Handle notification parameter from URL
  useEffect(() => {
    if (params.notification) {
      const message = decodeURIComponent(params.notification as string);
      setNotificationMessage(message);
      setShowNotification(true);
      // Clear the notification parameter from URL
      router.replace('/(tabs)/diary');
    }
  }, [params.notification]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [foods, presets, storedAppData] = await Promise.all([
        customFoodStorage.getCustomFoods(),
        mealPresetStorage.getMealPresets(),
        profileStorage.getAppData(),
      ]);
      setCustomFoods(foods);
      setMealPresets(presets);
      setAppData(storedAppData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePreset = () => {
    triggerHapticFeedback.light();
    router.push('/meal-preset?source=diary');
  };

  const handleAddCustomFood = () => {
    triggerHapticFeedback.light();
    router.push('/custom-food?source=diary');
  };

  const handleEditPreset = (preset: MealPreset) => {
    triggerHapticFeedback.light();
    router.push({
      pathname: '/meal-preset',
      params: {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        emoji: preset.emoji,
        source: 'diary',
      },
    });
  };

  const handleEditFood = (food: CustomFood) => {
    triggerHapticFeedback.light();
    router.push({
      pathname: '/custom-food',
      params: {
        id: food.id,
        name: food.name,
        emoji: food.emoji,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        calories: food.calories.toString(),
        protein: food.protein.toString(),
        carbs: food.carbs.toString(),
        fat: food.fat.toString(),
        source: 'diary',
      },
    });
  };

  const filteredPresets = mealPresets.filter(preset =>
    preset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFoods = customFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <NotificationBanner
        visible={showNotification}
        message={notificationMessage}
        onHide={() => setShowNotification(false)}
      />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Manager</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search presets and foods..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleCreatePreset}>
            <ChefHat size={18} color="#ffffff" />
            <Text style={styles.quickActionText}>Create Preset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleAddCustomFood}>
            <Apple size={18} color="#ffffff" />
            <Text style={styles.quickActionText}>Add Food</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'presets' && styles.activeTab]}
          onPress={() => setActiveTab('presets')}
        >
          <Utensils size={20} color={activeTab === 'presets' ? '#22c55e' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'presets' && styles.activeTabText]}>
            Meal Presets ({mealPresets.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'foods' && styles.activeTab]}
          onPress={() => setActiveTab('foods')}
        >
          <Package size={20} color={activeTab === 'foods' ? '#22c55e' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'foods' && styles.activeTabText]}>
            Custom Foods ({customFoods.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'presets' ? (
          <View style={styles.presetsSection}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading meal presets...</Text>
              </View>
            ) : filteredPresets.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateEmoji}>🍽️</Text>
                <Text style={styles.emptyStateTitle}>No Meal Presets Yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery 
                    ? 'No presets match your search. Try a different term.'
                    : 'Create your first meal preset to get started!'
                  }
                </Text>

              </View>
            ) : (
              filteredPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.presetCard}
                  onPress={() => handleEditPreset(preset)}
                  activeOpacity={0.7}
                >
                  <View style={styles.presetHeader}>
                    <View style={styles.presetIcon}>
                      <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                    </View>
                    <View style={styles.presetInfo}>
                      <Text style={styles.presetName}>{preset.name}</Text>
                      <Text style={styles.presetDescription}>{preset.description}</Text>
                      <Text style={styles.presetStats}>
                        {preset.totalCalories} cal • {preset.foods.length} items
                      </Text>
                    </View>
                  </View>
                  <View style={styles.presetNutrition}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{appData.units === 'Imperial' ? (preset.totalProtein / 28.3495).toFixed(1) : preset.totalProtein}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                      <Text style={styles.nutritionLabel}>protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{appData.units === 'Imperial' ? (preset.totalCarbs / 28.3495).toFixed(1) : preset.totalCarbs}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                      <Text style={styles.nutritionLabel}>carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{appData.units === 'Imperial' ? (preset.totalFat / 28.3495).toFixed(1) : preset.totalFat}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                      <Text style={styles.nutritionLabel}>fat</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View style={styles.foodsSection}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading custom foods...</Text>
              </View>
            ) : filteredFoods.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateEmoji}>🍽️</Text>
                <Text style={styles.emptyStateTitle}>No Custom Foods Yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery 
                    ? 'No foods match your search. Try a different term.'
                    : 'Create your first custom food to get started!'
                  }
                </Text>

              </View>
            ) : (
              filteredFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.foodCard}
                  onPress={() => handleEditFood(food)}
                  activeOpacity={0.7}
                >
                  <View style={styles.foodHeader}>
                    <View style={styles.foodIcon}>
                      <Text style={styles.foodEmoji}>{food.emoji}</Text>
                    </View>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodServing}>
                        Per {convertServingSize(food.servingSize, appData.units === 'Imperial', food.servingUnit)} {food.servingUnit === 'units' ? '' : food.servingUnit === 'grams' && appData.units === 'Imperial' ? 'oz' : food.servingUnit}
                      </Text>
                      <Text style={styles.foodDate}>
                        Created {new Date(food.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.foodNutrition}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{food.calories}</Text>
                      <Text style={styles.nutritionLabel}>cal</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{convertNutritionalValue(food.protein, appData.units === 'Imperial', food.servingUnit)}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                      <Text style={styles.nutritionLabel}>protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{convertNutritionalValue(food.carbs, appData.units === 'Imperial', food.servingUnit)}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                      <Text style={styles.nutritionLabel}>carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{convertNutritionalValue(food.fat, appData.units === 'Imperial', food.servingUnit)}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                      <Text style={styles.nutritionLabel}>fat</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#22c55e',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  presetsSection: {
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  presetCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  presetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  presetEmoji: {
    fontSize: 24,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  presetDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  presetStats: {
    fontSize: 12,
    color: '#6b7280',
  },
  presetNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  foodsSection: {
    paddingBottom: 100,
  },
  foodCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  foodEmoji: {
    fontSize: 24,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  foodServing: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 2,
  },
  foodDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  foodNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});