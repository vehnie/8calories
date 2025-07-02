import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Plus, Search, Camera, ArrowLeft, Package, Minus, X, ScanLine } from 'lucide-react-native';
import { NotificationBanner } from '@/components/NotificationBanner';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { triggerHapticFeedback } from '@/utils/haptics';
import { customFoodStorage, CustomFood, dailyMealStorage, profileStorage, AppData } from '@/utils/storage';

interface FoodOption {
  id: string;
  name: string;
  image: string;
  caloriesPerServing: number;
  servingSize: string;
  servingUnit: 'units' | 'grams' | 'ml';
  category: string;
  protein: number;
  carbs: number;
  fat: number;
  isCustom?: boolean;
  emoji?: string;
}

export default function AddScreen() {
  const params = useLocalSearchParams();
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodOption | null>(null);
  const [customAmount, setCustomAmount] = useState('1');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [appData, setAppData] = useState<AppData>({
    units: 'Metric',
    tdee: 'Mifflin-St Jeor',
  });
  const [longPressInterval, setLongPressInterval] = useState<NodeJS.Timeout | null>(null);

  // Handle notification from URL params
  useEffect(() => {
    if (params.notification) {
      setNotificationMessage(decodeURIComponent(params.notification as string));
      setShowNotification(true);
      // Clear the notification param from URL
      router.replace('/(tabs)/add');
    }
  }, [params.notification]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (longPressInterval) {
        clearInterval(longPressInterval);
      }
    };
  }, [longPressInterval]);

  // Always reset state when tab becomes focused, except when directly navigating with meal param
  useFocusEffect(
    React.useCallback(() => {
      // Reset state to ensure navbar plus always shows meal selection
      setSelectedMeal(params.meal ? params.meal as string : null);
      setSearchQuery('');
      setSelectedFood(null);
      loadData();
    }, [params.meal])
  );

  const loadData = async () => {
    try {
      const [foods, storedAppData] = await Promise.all([
        customFoodStorage.getCustomFoods(),
        profileStorage.getAppData(),
      ]);
      setCustomFoods(foods);
      setAppData(storedAppData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const foodOptions: FoodOption[] = [
    {
      id: '1',
      name: 'Banana',
      image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 105,
      servingSize: '1 medium',
      servingUnit: 'units',
      category: 'Fruits',
      protein: 1.3,
      carbs: 27,
      fat: 0.3,
    },
    {
      id: '2',
      name: 'Greek Yogurt',
      image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 130,
      servingSize: '100g',
      servingUnit: 'grams',
      category: 'Dairy',
      protein: 20,
      carbs: 9,
      fat: 0,
    },
    {
      id: '3',
      name: 'Grilled Chicken Breast',
      image: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 231,
      servingSize: '100g',
      servingUnit: 'grams',
      category: 'Protein',
      protein: 43.5,
      carbs: 0,
      fat: 5,
    },
    {
      id: '4',
      name: 'Brown Rice',
      image: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 216,
      servingSize: '1 cup cooked',
      servingUnit: 'units',
      category: 'Grains',
      protein: 5,
      carbs: 45,
      fat: 1.8,
    },
    {
      id: '5',
      name: 'Avocado',
      image: 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 234,
      servingSize: '1 medium',
      servingUnit: 'units',
      category: 'Fruits',
      protein: 2.9,
      carbs: 12,
      fat: 21,
    },
    {
      id: '6',
      name: 'Almonds',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 164,
      servingSize: '28g',
      servingUnit: 'grams',
      category: 'Nuts',
      protein: 6,
      carbs: 6,
      fat: 14,
    },
    {
      id: '7',
      name: 'Salmon Fillet',
      image: 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 206,
      servingSize: '100g',
      servingUnit: 'grams',
      category: 'Protein',
      protein: 22,
      carbs: 0,
      fat: 12,
    },
    {
      id: '8',
      name: 'Orange Juice',
      image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 112,
      servingSize: '250ml',
      servingUnit: 'ml',
      category: 'Beverages',
      protein: 1.7,
      carbs: 26,
      fat: 0.5,
    },
  ];

  // Load custom foods when component mounts or when meal is selected
  useEffect(() => {
    if (selectedMeal) {
      loadCustomFoods();
    }
  }, [selectedMeal]);

  const loadCustomFoods = async () => {
    try {
      const foods = await customFoodStorage.getCustomFoods();
      setCustomFoods(foods);
    } catch (error) {
      console.error('Error loading custom foods:', error);
    }
  };

  // Convert custom foods to food options format
  const customFoodOptions: FoodOption[] = customFoods.map(food => ({
    id: `custom_${food.id}`,
    name: food.name,
    image: '', // Custom foods use emoji instead
    caloriesPerServing: food.calories,
    servingSize: food.servingSize,
    servingUnit: food.servingUnit,
    category: 'Custom Foods',
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    isCustom: true,
    emoji: food.emoji,
  }));

  // Combine regular foods and custom foods
  const allFoodOptions = [...foodOptions, ...customFoodOptions];

  const handleMealSelect = (mealType: string) => {
    triggerHapticFeedback.light();
    setSelectedMeal(mealType);
  };

  const handleBack = () => {
    triggerHapticFeedback.light();
    if (selectedFood) {
      setSelectedFood(null);
      setCustomAmount('1');
    } else if (selectedMeal) {
      // If we came from calendar with a meal parameter, go back to calendar
      if (params.meal) {
        router.push('/(tabs)/calendar');
      } else {
        setSelectedMeal(null);
        setSearchQuery('');
      }
    } else {
      // If no meal or food selected, navigate back
      router.back();
    }
  };

  const handleFoodSelect = (food: FoodOption) => {
    triggerHapticFeedback.light();
    setSelectedFood(food);
    setCustomAmount('1');
  };

  const adjustAmount = (increment: boolean) => {
    triggerHapticFeedback.light();
    const current = parseFloat(customAmount) || 1;
    
    let step, min;
      if (selectedFood?.servingUnit === 'grams') {
        if (appData.units === 'Imperial') {
          // For Imperial, work with smaller increments (0.1 oz = ~2.8g)
          step = Math.round(0.1 * 28.3495); // ~3g
          min = Math.round(0.1 * 28.3495); // ~3g
        } else {
          step = 1;
          min = 1;
        }
      } else if (selectedFood?.servingUnit === 'ml') {
        step = 1;
        min = 1;
      } else {
        step = 0.5;
        min = 0.5;
      }
     
    if (increment) {
      setCustomAmount((current + step).toString());
    } else if (current > min) {
      setCustomAmount((current - step).toString());
    }
  };

  const startLongPress = (increment: boolean) => {
    // Clear any existing interval
    if (longPressInterval) {
      clearInterval(longPressInterval);
    }
    
    // Start continuous adjustment
    const interval = setInterval(() => {
      setCustomAmount(prevAmount => {
        const current = parseFloat(prevAmount) || 1;
        
        let step, min;
        if (selectedFood?.servingUnit === 'grams') {
          if (appData.units === 'Imperial') {
            step = Math.round(0.1 * 28.3495); // ~3g
            min = Math.round(0.1 * 28.3495); // ~3g
          } else {
            step = 1;
            min = 1;
          }
        } else if (selectedFood?.servingUnit === 'ml') {
          step = 1;
          min = 1;
        } else {
          step = 0.5;
          min = 0.5;
        }
        
        if (increment) {
          return (current + step).toString();
        } else if (current > min) {
          return (current - step).toString();
        }
        return prevAmount;
      });
      
      triggerHapticFeedback.light();
    }, 150); // Adjust every 150ms
    
    setLongPressInterval(interval);
  };

  const stopLongPress = () => {
    if (longPressInterval) {
      clearInterval(longPressInterval);
      setLongPressInterval(null);
    }
  };

  const handleAddFood = async () => {
    if (!selectedFood || !selectedMeal) return;
    
    triggerHapticFeedback.success();
    const amount = parseFloat(customAmount) || 1;
    
    // Calculate multiplier based on serving unit
    let multiplier = 1;
    if (selectedFood.servingUnit === 'grams') {
      const baseGrams = parseInt(selectedFood.servingSize.replace(/[^\d]/g, ''));
      multiplier = amount / baseGrams;
    } else if (selectedFood.servingUnit === 'ml') {
      const baseMl = parseInt(selectedFood.servingSize.replace(/[^\d]/g, ''));
      multiplier = amount / baseMl;
    } else {
      multiplier = amount;
    }
    
    const totalCalories = Math.round(selectedFood.caloriesPerServing * multiplier);
    const totalProtein = Math.round(selectedFood.protein * multiplier);
    const totalCarbs = Math.round(selectedFood.carbs * multiplier);
    const totalFat = Math.round(selectedFood.fat * multiplier);
    
    try {
      // Save meal entry to local storage
      // Use params.date when coming from calendar, otherwise use today's date
      let targetDate;
      if (params.date) {
        // Use the date from calendar navigation
        targetDate = params.date as string;
      } else {
        // Use today's date when accessed via tab navigation
        const today = new Date();
        targetDate = today.getFullYear() + '-' + 
          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
          String(today.getDate()).padStart(2, '0');
      }
      await dailyMealStorage.addMealEntry({
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        emoji: selectedFood.emoji,
        mealType: selectedMeal as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
        amount: amount,
        servingUnit: selectedFood.servingUnit,
        servingSize: selectedFood.servingSize,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        date: targetDate,
      });
      
      // Show success notification
      const mealName = selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1);
      setNotificationMessage(`${selectedFood.name} added to ${mealName}! (${totalCalories} cal)`);
      setShowNotification(true);
      
    } catch (error) {
      console.error('Error saving meal entry:', error);
      setNotificationMessage('Error adding food. Please try again.');
      setShowNotification(true);
    }
    
    // Go back to search screen
    setSelectedFood(null);
    setCustomAmount('1');
  };

  const handleScanBarcode = () => {
    triggerHapticFeedback.light();
    router.push('/scanner');
  };

  const handleCreateCustomFood = () => {
    triggerHapticFeedback.light();
    router.push('/custom-food?source=add');
  };

  const filteredFoods = allFoodOptions.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate custom foods and regular foods for better organization
  const filteredCustomFoods = filteredFoods.filter(food => food.isCustom);
  const filteredRegularFoods = filteredFoods.filter(food => !food.isCustom);

  const getDisplayServingSize = (servingSize: string) => {
    // Convert serving size from grams to ounces if Imperial units are selected
    if (appData.units === 'Imperial' && servingSize.includes('g')) {
      const grams = parseInt(servingSize.replace(/[^\d]/g, ''));
      if (grams) {
        const ounces = Math.round((grams / 28.3495) * 10) / 10;
        return servingSize.replace(/\d+g/, `${ounces}oz`);
      }
    }
    return servingSize;
  };

  // Convert amount display based on selected units
  const getDisplayAmount = (amount: number, servingUnit: string) => {
    if (servingUnit === 'units') {
      return `${amount} × ${selectedFood?.servingSize}`;
    } else if (servingUnit === 'grams') {
      if (appData.units === 'Imperial') {
        const ounces = Math.round((amount / 28.3495) * 10) / 10;
        return `${ounces}oz`;
      }
      return `${amount}g`;
    } else {
      return `${amount}ml`;
    }
  };

  // Get unit display text for input field
  const getUnitDisplayText = (servingUnit: string) => {
    if (servingUnit === 'units') return '';
    if (servingUnit === 'grams') {
      return appData.units === 'Imperial' ? 'ounces' : 'grams';
    }
    return servingUnit;
  };

  // Get display value for input field (converted for Imperial)
  const getDisplayInputValue = () => {
    const amount = parseFloat(customAmount) || 1;
    if (selectedFood?.servingUnit === 'grams' && appData.units === 'Imperial') {
      const ounces = Math.round((amount / 28.3495) * 10) / 10;
      return ounces.toString();
    }
    return customAmount;
  };

  // Handle input change with conversion
  const handleAmountChange = (value: string) => {
    if (selectedFood?.servingUnit === 'grams' && appData.units === 'Imperial') {
      // Convert from ounces to grams for storage
      const ounces = parseFloat(value) || 0;
      const grams = Math.round(ounces * 28.3495);
      setCustomAmount(grams.toString());
    } else {
      setCustomAmount(value);
    }
  };

  const getAmountLabel = () => {
    if (!selectedFood) return 'Amount';
    
    switch (selectedFood.servingUnit) {
      case 'grams':
        return appData.units === 'Imperial' ? 'Ounces' : 'Grams';
      case 'ml':
        return 'Milliliters';
      case 'units':
        return `Number of ${selectedFood.servingSize}`;
      default:
        return 'Amount';
    }
  };

  if (!selectedMeal) {
    // Meal Category Selection Screen
    return (
      <SafeAreaView style={styles.container}>
        <NotificationBanner
          visible={showNotification}
          message={notificationMessage}
          onHide={() => setShowNotification(false)}
        />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Food</Text>
          <Text style={styles.headerSubtitle}>Select meal category</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.mealGrid}>
            <TouchableOpacity 
              style={styles.mealButton}
              onPress={() => handleMealSelect('breakfast')}
            >
              <Text style={styles.mealEmoji}>🍳</Text>
              <Text style={styles.mealText}>Breakfast</Text>
              <Text style={styles.mealTime}>6:00 - 11:00</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mealButton}
              onPress={() => handleMealSelect('lunch')}
            >
              <Text style={styles.mealEmoji}>🥗</Text>
              <Text style={styles.mealText}>Lunch</Text>
              <Text style={styles.mealTime}>11:00 - 16:00</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mealButton}
              onPress={() => handleMealSelect('dinner')}
            >
              <Text style={styles.mealEmoji}>🍽️</Text>
              <Text style={styles.mealText}>Dinner</Text>
              <Text style={styles.mealTime}>16:00 - 22:00</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mealButton}
              onPress={() => handleMealSelect('snacks')}
            >
              <Text style={styles.mealEmoji}>🍿</Text>
              <Text style={styles.mealText}>Snack</Text>
              <Text style={styles.mealTime}>Anytime</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedFood) {
    // Amount Selection Screen
    const amount = parseFloat(customAmount) || 1;
    
    // Calculate multiplier based on serving unit
    let multiplier = 1;
    if (selectedFood.servingUnit === 'grams') {
      const baseGrams = parseInt(selectedFood.servingSize.replace(/[^\d]/g, ''));
      multiplier = amount / baseGrams;
    } else if (selectedFood.servingUnit === 'ml') {
      const baseMl = parseInt(selectedFood.servingSize.replace(/[^\d]/g, ''));
      multiplier = amount / baseMl;
    } else {
      multiplier = amount;
    }
    
    const totalCalories = Math.round(selectedFood.caloriesPerServing * multiplier);
    const totalProtein = Math.round(selectedFood.protein * multiplier * 10) / 10;
    const totalCarbs = Math.round(selectedFood.carbs * multiplier * 10) / 10;
    const totalFat = Math.round(selectedFood.fat * multiplier * 10) / 10;

    return (
      <SafeAreaView style={styles.container}>
        <NotificationBanner
          visible={showNotification}
          message={notificationMessage}
          onHide={() => setShowNotification(false)}
        />
        
        {/* Header */}
        <View style={styles.searchHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.searchHeaderContent}>
            <Text style={styles.searchHeaderTitle}>Select Amount</Text>
          </View>
        </View>

        <ScrollView style={styles.portionContent}>
          {/* Food Info */}
          <View style={styles.foodInfoCard}>
            {selectedFood.isCustom ? (
              <View style={styles.customFoodIcon}>
                <Text style={styles.customFoodEmoji}>{selectedFood.emoji}</Text>
              </View>
            ) : (
              <Image source={{ uri: selectedFood.image }} style={styles.foodInfoImage} />
            )}
            <View style={styles.foodInfoDetails}>
              <Text style={styles.foodInfoName}>{selectedFood.name}</Text>
              <Text style={styles.foodInfoCategory}>{selectedFood.category}</Text>
              <Text style={styles.foodInfoServing}>Per {getDisplayServingSize(selectedFood.servingSize)}</Text>
            </View>
          </View>

          {/* Amount Control */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>{getAmountLabel()}</Text>
            <View style={styles.amountControl}>
              <TouchableOpacity
                style={styles.amountButton}
                onPress={() => adjustAmount(false)}
                onLongPress={() => startLongPress(false)}
                onPressOut={stopLongPress}
                delayLongPress={500}
              >
                <Minus size={20} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  value={getDisplayInputValue()}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <Text style={styles.amountUnit}>
                  {getUnitDisplayText(selectedFood.servingUnit)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.amountButton}
                onPress={() => adjustAmount(true)}
                onLongPress={() => startLongPress(true)}
                onPressOut={stopLongPress}
                delayLongPress={500}
              >
                <Plus size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            {/* Amount Description */}
            <Text style={styles.amountDescription}>
              {getDisplayAmount(amount, selectedFood.servingUnit)}
            </Text>
          </View>

          {/* Nutrition Summary */}
          <View style={styles.nutritionSection}>
            <Text style={styles.sectionTitle}>Nutrition Summary</Text>
            <View style={styles.nutritionCard}>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{totalCalories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{totalProtein}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{totalCarbs}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{totalFat}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Add Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
            <Text style={styles.addButtonText}>
              Add to {selectedMeal?.charAt(0).toUpperCase() + selectedMeal?.slice(1)}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Food Search Screen (directly shown after meal selection)
  return (
    <SafeAreaView style={styles.container}>
      <NotificationBanner
        visible={showNotification}
        message={notificationMessage}
        onHide={() => setShowNotification(false)}
      />
      
      {/* Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.searchHeaderContent}>
          <Text style={styles.searchHeaderTitle}>
            {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
          </Text>
        </View>
        <TouchableOpacity style={styles.barcodeButton} onPress={handleScanBarcode}>
          <ScanLine size={24} color="#22c55e" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.plusButton} onPress={handleCreateCustomFood}>
          <Plus size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search foods..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Search Results */}
      <ScrollView style={styles.foodsList} showsVerticalScrollIndicator={false}>
        {!searchQuery && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>Search for foods</Text>
            <Text style={styles.emptyStateSubtext}>
              Start typing to find foods from our database or your custom foods
            </Text>
          </View>
        )}
        
        {searchQuery && filteredFoods.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No foods found</Text>
            <Text style={styles.noResultsSubtext}>
              Try scanning a barcode or creating a custom food
            </Text>
            <TouchableOpacity 
              style={styles.createFoodButton} 
              onPress={handleCreateCustomFood}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.createFoodButtonText}>Create "{searchQuery}"</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {searchQuery && filteredFoods.length > 0 && (
          <>
            <Text style={styles.resultsTitle}>
              {filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''} found
            </Text>
            
            {/* Custom Foods Section */}
            {filteredCustomFoods.length > 0 && (
              <>
                <View style={styles.sectionHeaderContainer}>
                  <Package size={16} color="#22c55e" />
                  <Text style={styles.sectionHeaderText}>Your Custom Foods</Text>
                </View>
                {filteredCustomFoods.map((food) => (
                  <TouchableOpacity
                    key={food.id}
                    style={[styles.foodItem, styles.customFoodItem]}
                    onPress={() => handleFoodSelect(food)}
                  >
                    <View style={styles.customFoodIconSmall}>
                      <Text style={styles.customFoodEmojiSmall}>{food.emoji}</Text>
                    </View>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodCategory}>{food.category}</Text>
                      <Text style={styles.servingSize}>{getDisplayServingSize(food.servingSize)}</Text>
                    </View>
                    <View style={styles.foodStats}>
                      <Text style={styles.calories}>{food.caloriesPerServing}</Text>
                      <Text style={styles.caloriesLabel}>cal</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
            
            {/* Regular Foods Section */}
            {filteredRegularFoods.length > 0 && (
              <>
                {filteredCustomFoods.length > 0 && (
                  <View style={styles.sectionHeaderContainer}>
                    <Search size={16} color="#3b82f6" />
                    <Text style={styles.sectionHeaderText}>Food Database</Text>
                  </View>
                )}
                {filteredRegularFoods.map((food) => (
                  <TouchableOpacity
                    key={food.id}
                    style={styles.foodItem}
                    onPress={() => handleFoodSelect(food)}
                  >
                    <Image source={{ uri: food.image }} style={styles.foodImage} />
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodCategory}>{food.category}</Text>
                      <Text style={styles.servingSize}>{getDisplayServingSize(food.servingSize)}</Text>
                    </View>
                    <View style={styles.foodStats}>
                      <Text style={styles.calories}>{food.caloriesPerServing}</Text>
                      <Text style={styles.caloriesLabel}>cal</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  mealButton: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  mealEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  mealText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 14,
    color: '#666666',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  searchHeaderContent: {
    flex: 1,
  },
  searchHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  barcodeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  plusButton: {
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
  foodsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginLeft: 8,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  customFoodItem: {
    borderWidth: 1,
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#2a2a2a',
  },
  customFoodIconSmall: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customFoodEmojiSmall: {
    fontSize: 28,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  foodCategory: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 2,
  },
  servingSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  foodStats: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createFoodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  // Amount Selection Styles
  portionContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  foodInfoImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  customFoodIcon: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  customFoodEmoji: {
    fontSize: 40,
  },
  foodInfoDetails: {
    flex: 1,
  },
  foodInfoName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  foodInfoCategory: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 2,
  },
  foodInfoServing: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  amountSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  amountControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  amountButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  amountInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    minWidth: 60,
  },
  amountUnit: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 4,
  },
  amountDescription: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
  },
  nutritionSection: {
    marginBottom: 32,
  },
  nutritionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  addButtonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  addButton: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});