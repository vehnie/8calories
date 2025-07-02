import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react-native';
import { CalorieProgressBar } from '@/components/CalorieProgressBar';
import { MacroCircle } from '@/components/MacroCircle';
import { FoodItemCard } from '@/components/FoodItemCard';
import { dailyMealStorage, DailyMealEntry, profileStorage, ProfileData, AppData } from '@/utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { EditFoodModal } from '@/components/EditFoodModal';

interface FoodItem {
  id: string;
  name: string;
  weight: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  icon: string;
  servingUnit?: 'grams' | 'ml' | 'units';
}

export default function HomeScreen() {
  const [breakfastItems, setBreakfastItems] = useState<FoodItem[]>([]);
  const [lunchItems, setLunchItems] = useState<FoodItem[]>([]);
  const [dinnerItems, setDinnerItems] = useState<FoodItem[]>([]);
  const [snackItems, setSnackItems] = useState<FoodItem[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [mealEntries, setMealEntries] = useState<DailyMealEntry[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({
    activity: 'Moderately Active',
    goal: 'Lose Weight',
    weight: '70',
    height: '175',
    age: '28',
    gender: 'Male',
  });
  const [appData, setAppData] = useState<AppData>({
    units: 'Metric',
    tdee: 'Mifflin-St Jeor',
  });

  // Load profile data from storage
  const loadProfileData = async () => {
    try {
      const storedProfileData = await profileStorage.getProfileData();
      const storedAppData = await profileStorage.getAppData();
      setProfileData(storedProfileData);
      setAppData(storedAppData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  // Convert DailyMealEntry to FoodItem format
  const convertMealEntryToFoodItem = (entry: DailyMealEntry): FoodItem => {
    const weight = entry.servingUnit === 'units' 
      ? `${entry.amount} ${entry.servingSize}`
      : `${entry.amount}${entry.servingUnit}`;
    
    return {
      id: entry.id,
      name: entry.foodName,
      weight: weight,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      icon: entry.emoji || '🍽️',
      servingUnit: entry.servingUnit,
    };
  };

  // Load today's meals from storage
  const loadTodaysMeals = async () => {
    try {
      const breakfastMeals = await dailyMealStorage.getTodaysMealsByType('breakfast');
      const lunchMeals = await dailyMealStorage.getTodaysMealsByType('lunch');
      const dinnerMeals = await dailyMealStorage.getTodaysMealsByType('dinner');
      const snackMeals = await dailyMealStorage.getTodaysMealsByType('snacks');

      const allEntries = [...breakfastMeals, ...lunchMeals, ...dinnerMeals, ...snackMeals];
      setMealEntries(allEntries);

      setBreakfastItems(breakfastMeals.map(convertMealEntryToFoodItem));
      setLunchItems(lunchMeals.map(convertMealEntryToFoodItem));
      setDinnerItems(dinnerMeals.map(convertMealEntryToFoodItem));
      setSnackItems(snackMeals.map(convertMealEntryToFoodItem));
    } catch (error) {
      console.error('Error loading today\'s meals:', error);
    }
  };

  const handleFoodItemPress = (item: FoodItem) => {
    setSelectedFoodItem(item);
    setEditModalVisible(true);
  };

  const handleEditFood = async (id: string, newAmount: number) => {
    try {
      const originalEntry = mealEntries.find(entry => entry.id === id);
      if (!originalEntry) return;

      await dailyMealStorage.updateMealAmount(id, newAmount, originalEntry);
      await loadTodaysMeals(); // Reload data
    } catch (error) {
      console.error('Error editing food:', error);
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      await dailyMealStorage.deleteMealEntry(id);
      await loadTodaysMeals(); // Reload data
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  // Calculation functions from profile page
  const calculateBMR = () => {
    let weight = parseFloat(profileData.weight);
    let height = parseFloat(profileData.height);
    const age = parseFloat(profileData.age);
    const isMale = profileData.gender === 'Male';

    // Convert to metric units for calculations if currently in Imperial
    if (appData.units === 'Imperial') {
      weight = weight / 2.20462; // lbs to kg
      height = height * 2.54; // inches to cm
    }

    switch (appData.tdee) {
      case 'Mifflin-St Jeor':
        return isMale
          ? 10 * weight + 6.25 * height - 5 * age + 5
          : 10 * weight + 6.25 * height - 5 * age - 161;
      
      case 'Harris-Benedict':
        return isMale
          ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
          : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      
      case 'Katch-McArdle':
        // Calculate Lean Body Mass using Boer formula
        const lbm = 0.407 * weight + 0.267 * height - 19.2;
        // Katch-McArdle equation: BMR = 370 + (21.6 × LBM)
        return 370 + (21.6 * lbm);
      
      case 'Cunningham':
        // Calculate Lean Body Mass using Boer formula (since body fat % not available)
        const cunninghamLbm = 0.407 * weight + 0.267 * height - 19.2;
        // Cunningham equation: RMR = 500 + (22 × LBM)
        return 500 + (22 * cunninghamLbm);
      
      default:
        return 0;
    }
  };

  const getActivityMultiplier = () => {
    switch (profileData.activity) {
      case 'Sedentary': return 1.2;
      case 'Lightly Active': return 1.375;
      case 'Moderately Active': return 1.55;
      case 'Very Active': return 1.725;
      case 'Extremely Active': return 1.9;
      default: return 1.55;
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const activityMultiplier = getActivityMultiplier();
    return Math.round(bmr * activityMultiplier);
  };

  const calculateDailyCalories = () => {
    const tdee = calculateTDEE();
    switch (profileData.goal) {
      case 'Lose Weight': return Math.round(tdee - 500); // 500 calorie deficit
      case 'Gain Weight': return Math.round(tdee + 500); // 500 calorie surplus
      case 'Maintain Weight': return tdee;
      default: return tdee;
    }
  };

  const calculateMacros = () => {
    const dailyCalories = calculateDailyCalories();
    // Standard macro distribution: 30% protein, 40% carbs, 30% fat
    const proteinGrams = Math.round((dailyCalories * 0.30) / 4); // 4 calories per gram
    const fatGrams = Math.round((dailyCalories * 0.30) / 9); // 9 calories per gram
    const carbsGrams = Math.round((dailyCalories * 0.40) / 4); // 4 calories per gram
    
    // Convert to ounces if Imperial units are selected
    if (appData.units === 'Imperial') {
      return {
        protein: Math.round((proteinGrams / 28.3495) * 10) / 10, // Convert to oz with 1 decimal
        carbs: Math.round((carbsGrams / 28.3495) * 10) / 10,     // Convert to oz with 1 decimal
        fat: Math.round((fatGrams / 28.3495) * 10) / 10          // Convert to oz with 1 decimal
      };
    }
    
    return { protein: proteinGrams, carbs: carbsGrams, fat: fatGrams };
  };

  // Reload meals and profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTodaysMeals();
      loadProfileData();
    }, [])
  );

  // Calculate totals
  const allItems = [...breakfastItems, ...lunchItems, ...dinnerItems, ...snackItems];
  const totalCalories = allItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinGrams = allItems.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbsGrams = allItems.reduce((sum, item) => sum + item.carbs, 0);
  const totalFatGrams = allItems.reduce((sum, item) => sum + item.fat, 0);
  
  // Convert totals to appropriate units
  const totalProtein = appData.units === 'Imperial' 
    ? Math.round((totalProteinGrams / 28.3495) * 10) / 10 
    : totalProteinGrams;
  const totalCarbs = appData.units === 'Imperial' 
    ? Math.round((totalCarbsGrams / 28.3495) * 10) / 10 
    : totalCarbsGrams;
  const totalFat = appData.units === 'Imperial' 
    ? Math.round((totalFatGrams / 28.3495) * 10) / 10 
    : totalFatGrams;

  // Goals - calculated using the same functions as profile page
  const calorieGoal = calculateDailyCalories();
  const macros = calculateMacros();
  const proteinGoal = macros.protein;
  const carbsGoal = macros.carbs;
  const fatGoal = macros.fat;

  const caloriesLeft = calorieGoal - totalCalories;
  const proteinLeft = appData.units === 'Imperial' 
    ? Math.round((proteinGoal - totalProtein) * 10) / 10
    : proteinGoal - totalProtein;
  const carbsLeft = appData.units === 'Imperial' 
    ? Math.round((carbsGoal - totalCarbs) * 10) / 10
    : carbsGoal - totalCarbs;
  const fatLeft = appData.units === 'Imperial' 
    ? Math.round((fatGoal - totalFat) * 10) / 10
    : fatGoal - totalFat;



  const renderMealSection = (title: string, items: FoodItem[]) => {
    // Calculate totals for this meal
    const mealCalories = items.reduce((sum, item) => sum + item.calories, 0);
    const mealProteinGrams = items.reduce((sum, item) => sum + item.protein, 0);
    const mealCarbsGrams = items.reduce((sum, item) => sum + item.carbs, 0);
    const mealFatGrams = items.reduce((sum, item) => sum + item.fat, 0);
    
    // Convert to appropriate units for display
    const mealProtein = appData.units === 'Imperial' 
      ? Math.round((mealProteinGrams / 28.3495) * 10) / 10 
      : mealProteinGrams;
    const mealCarbs = appData.units === 'Imperial' 
      ? Math.round((mealCarbsGrams / 28.3495) * 10) / 10 
      : mealCarbsGrams;
    const mealFat = appData.units === 'Imperial' 
      ? Math.round((mealFatGrams / 28.3495) * 10) / 10 
      : mealFatGrams;

    return (
      <View style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>{title}</Text>
        </View>
        {items.length > 0 && (
          <View style={styles.mealTotals}>
            <View style={styles.mealTotalItem}>
              <Text style={styles.mealTotalValue}>{mealCalories}</Text>
              <Text style={styles.mealTotalLabel}>cal</Text>
            </View>
            <View style={styles.mealTotalItem}>
              <Text style={styles.mealTotalValue}>{mealProtein.toFixed(1)}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
              <Text style={styles.mealTotalLabel}>protein</Text>
            </View>
            <View style={styles.mealTotalItem}>
              <Text style={styles.mealTotalValue}>{mealCarbs.toFixed(1)}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
              <Text style={styles.mealTotalLabel}>carbs</Text>
            </View>
            <View style={styles.mealTotalItem}>
              <Text style={styles.mealTotalValue}>{mealFat.toFixed(1)}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
              <Text style={styles.mealTotalLabel}>fat</Text>
            </View>
          </View>
        )}
        {items.length > 0 ? (
          items.map((item) => (
            <View key={item.id} style={styles.foodItemWrapper}>
              <FoodItemCard item={item} onPress={handleFoodItemPress} units={appData.units} />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No items added yet</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today</Text>
          <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
        </View>

        {/* Calories Progress */}
        <View style={styles.caloriesSection}>
          <View style={styles.caloriesHeader}>
            <View style={styles.caloriesLabelContainer}>
              <Flame size={20} color="#f97316" />
              <Text style={styles.caloriesLabel}>Calories left</Text>
            </View>
            <Text style={styles.caloriesValue}>{caloriesLeft}</Text>
          </View>
          <CalorieProgressBar 
            current={totalCalories} 
            goal={calorieGoal} 
          />
        </View>

        {/* Macros */}
        <View style={styles.macrosSection}>
          <MacroCircle
            icon={<Beef size={20} color="#ffffff" />}
            label="Protein left"
            value={appData.units === 'Imperial' ? parseFloat(proteinLeft.toFixed(1)) : proteinLeft}
            unit={appData.units === 'Imperial' ? 'oz' : 'g'}
            current={appData.units === 'Imperial' ? parseFloat(totalProtein.toFixed(1)) : totalProtein}
            goal={proteinGoal}
            color="#22c55e"
          />
          <MacroCircle
            icon={<Wheat size={20} color="#ffffff" />}
            label="Carbs left"
            value={appData.units === 'Imperial' ? parseFloat(carbsLeft.toFixed(1)) : carbsLeft}
            unit={appData.units === 'Imperial' ? 'oz' : 'g'}
            current={appData.units === 'Imperial' ? parseFloat(totalCarbs.toFixed(1)) : totalCarbs}
            goal={carbsGoal}
            color="#22c55e"
          />
          <MacroCircle
            icon={<Droplet size={20} color="#ffffff" />}
            label="Fat left"
            value={appData.units === 'Imperial' ? parseFloat(fatLeft.toFixed(1)) : fatLeft}
            unit={appData.units === 'Imperial' ? 'oz' : 'g'}
            current={appData.units === 'Imperial' ? parseFloat(totalFat.toFixed(1)) : totalFat}
            goal={fatGoal}
            color="#22c55e"
          />
        </View>

        {/* Meals */}
        {renderMealSection('Breakfast', breakfastItems)}
        {renderMealSection('Lunch', lunchItems)}
        {renderMealSection('Dinner', dinnerItems)}
        {renderMealSection('Snacks', snackItems)}

        <View style={{ height: 100 }} />
      </ScrollView>
      
      <EditFoodModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        item={selectedFoodItem}
        onEdit={handleEditFood}
        onDelete={handleDeleteFood}
        units={appData.units}
      />
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 16,
    color: '#666666',
  },
  caloriesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  caloriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  caloriesLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesLabel: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  caloriesValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  macrosSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 40,
    justifyContent: 'space-between',
  },
  mealSection: {
    marginBottom: 32,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 24,
    paddingTop: 0,
    paddingBottom: 0,
  },
  mealTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  mealTotals: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  mealTotalItem: {
    alignItems: 'center',
  },
  mealTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  mealTotalLabel: {
    fontSize: 12,
    color: '#666666',
  },
  foodItemWrapper: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});