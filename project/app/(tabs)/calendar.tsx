import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Plus, BarChart3 } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerHapticFeedback } from '@/utils/haptics';
import { dailyMealStorage, profileStorage } from '@/utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { FoodItemCard } from '@/components/FoodItemCard';
import { EditFoodModal } from '@/components/EditFoodModal';
import { ProfileData, AppData } from '@/utils/storage';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [weeklyData, setWeeklyData] = useState<Array<{day: string, calories: number, goal: number, date: Date}>>([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [dailyMeals, setDailyMeals] = useState<{[key: string]: any[]}>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<any>(null);
  const [mealEntries, setMealEntries] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({
    activity: 'Moderately Active',
    goal: 'Maintain Weight',
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

  // Goals - calculated using the same functions as profile page, memoized to update when profile data changes
  const calorieGoal = useMemo(() => calculateDailyCalories(), [profileData.goal, profileData.weight, profileData.height, profileData.age, profileData.gender, profileData.activity, appData.tdee]);
  const macros = useMemo(() => calculateMacros(), [profileData.goal, profileData.weight, profileData.height, profileData.age, profileData.gender, profileData.activity, appData.tdee, appData.units]);
  const proteinGoal = macros.protein;
  const carbsGoal = macros.carbs;
  const fatGoal = macros.fat;

  const caloriesLeft = calorieGoal - totalCalories;
  const proteinLeft = proteinGoal - totalProtein;
  const carbsLeft = carbsGoal - totalCarbs;
  const fatLeft = fatGoal - totalFat;

  const formatDateForStorage = (date: Date): string => {
    // Use local date to avoid timezone issues
    return date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
  };

  const formatDateForDisplay = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const loadSelectedDateSummary = async () => {
    try {
      const dateString = formatDateForStorage(selectedDate);
      const breakfastMeals = await dailyMealStorage.getMealsByType('breakfast', dateString);
      const lunchMeals = await dailyMealStorage.getMealsByType('lunch', dateString);
      const dinnerMeals = await dailyMealStorage.getMealsByType('dinner', dateString);
      const snackMeals = await dailyMealStorage.getMealsByType('snacks', dateString);

      const allMeals = [...breakfastMeals, ...lunchMeals, ...dinnerMeals, ...snackMeals];
      
      // Store meals by type for display
      setDailyMeals({
        breakfast: breakfastMeals,
        lunch: lunchMeals,
        dinner: dinnerMeals,
        snacks: snackMeals
      });
      
      const calories = allMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const protein = allMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const carbs = allMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const fat = allMeals.reduce((sum, meal) => sum + meal.fat, 0);

      setTotalCalories(calories);
      setTotalProtein(protein);
      setTotalCarbs(carbs);
      setTotalFat(fat);
    } catch (error) {
      console.error('Error loading selected date summary:', error);
    }
  };

  const loadWeeklyData = async () => {
    try {
      // Calculate the current calorie goal using current profileData
      const currentCalorieGoal = calculateDailyCalories();
      
      const startOfWeek = new Date(selectedDate);
      // Handle Sunday (getDay() = 0) by treating it as day 7
      const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
      startOfWeek.setDate(selectedDate.getDate() - dayOfWeek + 1); // Monday
      
      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyCalories = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        const dateString = formatDateForStorage(currentDay);
        
        const breakfastMeals = await dailyMealStorage.getMealsByType('breakfast', dateString);
        const lunchMeals = await dailyMealStorage.getMealsByType('lunch', dateString);
        const dinnerMeals = await dailyMealStorage.getMealsByType('dinner', dateString);
        const snackMeals = await dailyMealStorage.getMealsByType('snacks', dateString);
        
        const allMeals = [...breakfastMeals, ...lunchMeals, ...dinnerMeals, ...snackMeals];
        const dayCalories = allMeals.reduce((sum, meal) => sum + meal.calories, 0);
        
        weeklyCalories.push({
          day: weekDays[i],
          calories: dayCalories,
          goal: currentCalorieGoal,
          date: new Date(currentDay)
        });
      }
      
      setWeeklyData(weeklyCalories);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await loadProfileData();
        loadSelectedDateSummary();
        loadWeeklyData();
      };
      loadData();
    }, [selectedDate])
  );

  // Reload weekly data when profile data changes
  React.useEffect(() => {
    if (profileData.weight !== '70' || profileData.height !== '175') { // Check if profile data has been loaded
      loadWeeklyData();
    }
  }, [profileData.goal, profileData.weight, profileData.height, profileData.age, profileData.gender, profileData.activity, appData.tdee]);

  const handleCalendarPress = () => {
    triggerHapticFeedback.light();
    setCalendarDate(selectedDate);
    setShowCalendarModal(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendarModal(false);
    triggerHapticFeedback.selection();
  };

  const handleFoodItemPress = (item: any) => {
    setSelectedFoodItem(item);
    setEditModalVisible(true);
  };

  const handleEditFood = async (id: string, newAmount: number) => {
    try {
      const dateString = formatDateForStorage(selectedDate);
      const allMeals = await dailyMealStorage.getDailyMeals(dateString);
      const originalEntry = allMeals.find(entry => entry.id === id);
      if (!originalEntry) return;

      await dailyMealStorage.updateMealAmount(id, newAmount, originalEntry);
      await loadSelectedDateSummary(); // Reload data
      await loadWeeklyData(); // Update weekly chart
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error editing food:', error);
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      await dailyMealStorage.deleteMealEntry(id);
      await loadSelectedDateSummary(); // Reload data
      await loadWeeklyData(); // Update weekly chart
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  const handleCalendarNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCalendarDate(newDate);
    triggerHapticFeedback.light();
  };

  const renderCalendarGrid = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    // Add day headers
    const dayHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = currentDate.toDateString() === selectedDate.toDateString();
      
      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected
      });
    }
    
    return (
      <View style={styles.calendarGrid}>
        <View style={styles.dayHeaderRow}>
          {dayHeaders.map((header, index) => (
            <Text key={index} style={styles.dayHeader}>{header}</Text>
          ))}
        </View>
        <View style={styles.daysContainer}>
          {days.map((dayData, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                dayData.isSelected && styles.selectedDay,
                dayData.isToday && !dayData.isSelected && styles.todayDay
              ]}
              onPress={() => handleDateSelect(dayData.date)}
              disabled={!dayData.isCurrentMonth}
            >
              <Text style={[
                styles.dayText,
                !dayData.isCurrentMonth && styles.inactiveDayText,
                dayData.isSelected && styles.selectedDayText,
                dayData.isToday && !dayData.isSelected && styles.todayDayText
              ]}>
                {dayData.day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const handlePreviousDay = () => {
    triggerHapticFeedback.selection();
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const handleNextDay = () => {
    triggerHapticFeedback.selection();
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const handleAddFood = () => {
    triggerHapticFeedback.light();
    const dateString = formatDateForStorage(selectedDate);
    router.push(`/(tabs)/add?date=${dateString}`);
  };



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Diary</Text>
          <TouchableOpacity style={styles.calendarButton} onPress={handleCalendarPress}>
            <Calendar size={24} color="#22c55e" />
          </TouchableOpacity>
        </View>

        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={handlePreviousDay}>
            <ChevronLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDateForDisplay(selectedDate)}</Text>
          <TouchableOpacity style={styles.navButton} onPress={handleNextDay}>
            <ChevronRight size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Weekly Overview */}
        <View style={styles.weeklySection}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#22c55e" />
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
          </View>
          <View style={styles.weeklyChart}>
            {weeklyData.map((data, index) => {
              const height = (data.calories / data.goal) * 100;
              const today = new Date();
              const isToday = data.date.toDateString() === today.toDateString();
              
              // Color based on calorie intake relative to goal
              let barColor = '#333333'; // Default gray for no/low calories
              if (data.calories > 0) {
                if (height >= 110) {
                  barColor = '#ef4444'; // Red for significantly over goal
                } else if (height >= 100) {
                  barColor = '#f97316'; // Orange for over goal
                } else if (height >= 80) {
                  barColor = '#22c55e'; // Green for good range
                } else if (height >= 50) {
                  barColor = '#3b82f6'; // Blue for moderate
                } else {
                  barColor = '#6b7280'; // Gray for low intake
                }
              }
              
              // Add brightness for today
              if (isToday && barColor !== '#333333') {
                // Make today's bar slightly brighter by adjusting the color
                const brighterColors: { [key: string]: string } = {
                  '#ef4444': '#f87171', // Lighter red
                  '#f97316': '#fb923c', // Lighter orange
                  '#22c55e': '#4ade80', // Lighter green
                  '#3b82f6': '#60a5fa', // Lighter blue
                  '#6b7280': '#9ca3af'  // Lighter gray
                };
                barColor = brighterColors[barColor] || barColor;
              }
              
              // Check if this bar corresponds to the selected date
              const isSelectedDate = data.date.toDateString() === selectedDate.toDateString();
              
              return (
                <View key={data.day} style={styles.chartBar}>
                  <View style={[
                    styles.barContainer,
                    isSelectedDate && {
                      borderWidth: 2,
                      borderColor: '#22c55e'
                    }
                  ]}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: `${Math.min(height, 100)}%`,
                          backgroundColor: barColor,
                          maxHeight: '100%'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                    {data.day}
                  </Text>
                  <Text style={styles.calorieLabel}>{data.calories}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={24} color="#22c55e" />
            <Text style={styles.sectionTitle}>{formatDateForDisplay(selectedDate)}'s Summary</Text>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{totalCalories.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Calories</Text>
              <Text style={styles.summarySubtext}>{caloriesLeft > 0 ? `${caloriesLeft} left` : `${Math.abs(caloriesLeft)} over`}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{totalProtein.toFixed(1)}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
              <Text style={styles.summaryLabel}>Protein</Text>
              <Text style={styles.summarySubtext}>{proteinLeft > 0 ? `${proteinLeft.toFixed(1)}${appData.units === 'Imperial' ? 'oz' : 'g'} left` : `${Math.abs(proteinLeft).toFixed(1)}${appData.units === 'Imperial' ? 'oz' : 'g'} over`}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{totalCarbs.toFixed(1)}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
              <Text style={styles.summaryLabel}>Carbs</Text>
              <Text style={styles.summarySubtext}>{carbsLeft > 0 ? `${carbsLeft.toFixed(1)}${appData.units === 'Imperial' ? 'oz' : 'g'} left` : `${Math.abs(carbsLeft).toFixed(1)}${appData.units === 'Imperial' ? 'oz' : 'g'} over`}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{totalFat.toFixed(1)}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
              <Text style={styles.summaryLabel}>Fat</Text>
              <Text style={styles.summarySubtext}>{fatLeft > 0 ? `${fatLeft.toFixed(1)}${appData.units === 'Imperial' ? 'oz' : 'g'} left` : `${Math.abs(fatLeft).toFixed(1)}${appData.units === 'Imperial' ? 'oz' : 'g'} over`}</Text>
            </View>
          </View>
        </View>

        {/* Daily Meals */}
        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant" size={24} color="#22c55e" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{formatDateForDisplay(selectedDate)}'s Meals</Text>
          </View>
          {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealType) => {
            const meals = dailyMeals[mealType] || [];
            const mealTypeCapitalized = mealType.charAt(0).toUpperCase() + mealType.slice(1);
            
            // Calculate totals for this meal
            const mealCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
            const mealProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
            const mealCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
            const mealFat = meals.reduce((sum, meal) => sum + meal.fat, 0);
            
            return (
              <View key={mealType} style={styles.mealSection}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealTitle}>{mealTypeCapitalized}</Text>
                </View>
                {meals.length > 0 && (
                  <View style={styles.mealTotals}>
                    <View style={styles.mealTotalItem}>
                      <Text style={styles.mealTotalValue}>{Math.round(mealCalories)}</Text>
                      <Text style={styles.mealTotalLabel}>cal</Text>
                    </View>
                    <View style={styles.mealTotalItem}>
                      <Text style={styles.mealTotalValue}>{mealProtein.toFixed(1)}</Text>
                      <Text style={styles.mealTotalLabel}>protein</Text>
                    </View>
                    <View style={styles.mealTotalItem}>
                      <Text style={styles.mealTotalValue}>{mealCarbs.toFixed(1)}</Text>
                      <Text style={styles.mealTotalLabel}>carbs</Text>
                    </View>
                    <View style={styles.mealTotalItem}>
                      <Text style={styles.mealTotalValue}>{mealFat.toFixed(1)}</Text>
                      <Text style={styles.mealTotalLabel}>fat</Text>
                    </View>
                  </View>
                )}
                {meals.length > 0 ? (
                  meals.map((meal: any, index: number) => (
                    <FoodItemCard 
                       key={index} 
                       item={{
                         id: meal.id,
                         name: meal.foodName,
                         weight: meal.servingUnit === 'units' 
                           ? `${meal.amount} ${meal.servingSize}`
                           : `${meal.amount}${meal.servingUnit}`,
                         calories: meal.calories,
                         protein: meal.protein,
                         carbs: meal.carbs,
                         fat: meal.fat,
                         icon: meal.emoji || '🍽️',
                         servingUnit: meal.servingUnit
                       }} 
                       onPress={handleFoodItemPress}
                       units={appData.units}
                     />
                  ))
                ) : (
                  <Text style={styles.emptyText}>No items added yet</Text>
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddFood}>
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => handleCalendarNavigation('prev')}>
                <ChevronLeft size={24} color="#22c55e" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => handleCalendarNavigation('next')}>
                <ChevronRight size={24} color="#22c55e" />
              </TouchableOpacity>
            </View>
            {renderCalendarGrid()}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowCalendarModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Food Modal */}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  weeklySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    width: 20,
    backgroundColor: '#333333',
    borderRadius: 10,
    position: 'relative',
    marginBottom: 8,
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  todayLabel: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 10,
    color: '#999999',
  },
  summarySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 2,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#666666',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  calendarGrid: {
    marginBottom: 20,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    paddingVertical: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedDay: {
    backgroundColor: '#22c55e',
  },
  todayDay: {
    backgroundColor: '#333333',
  },
  dayText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  todayDayText: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  inactiveDayText: {
    color: '#444444',
  },
  modalCloseButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  mealsSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  mealSection: {
    marginBottom: 32,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealTitle: {
    fontSize: 20,
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
});