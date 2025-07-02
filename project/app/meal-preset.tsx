import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { ArrowLeft, Save, Smile, Trash2, Plus, Minus, Search, X, ScanLine, Package, Edit } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { NotificationBanner } from '@/components/NotificationBanner';
import { triggerHapticFeedback } from '@/utils/haptics';
import { mealPresetStorage, customFoodStorage, profileStorage, MealPreset, MealPresetFood, CustomFood, AppData } from '@/utils/storage';

const EMOJI_OPTIONS = [
  '🍳', '🥗', '🍽️', '🥪', '🍲', '🥘', '🍱', '🍜',
  '🍝', '🍕', '🌮', '🌯', '🥙', '🍔', '🍟', '🌭',
  '🥓', '🍗', '🥩', '🍖', '🐟', '🍤', '🦐', '🦀',
  '🥚', '🧀', '🥛', '☕', '🍵', '🥤', '🧃', '🍷',
];

interface FoodOption {
  id: string;
  name: string;
  image?: string;
  emoji?: string;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  servingSize: string;
  servingUnit: 'grams' | 'ml' | 'units';
  category: string;
  isCustom: boolean;
}

export default function MealPresetScreen() {
  const params = useLocalSearchParams();
  const isEditing = !!params.id;
  
  // Phase management
  const [currentPhase, setCurrentPhase] = useState<'basic' | 'foods'>(isEditing ? 'foods' : 'basic');
  
  // Basic info state
  const [presetName, setPresetName] = useState(params.name as string || '');
  const [presetDescription, setPresetDescription] = useState(params.description as string || '');
  const [selectedEmoji, setSelectedEmoji] = useState(params.emoji as string || '🍽️');
  
  // Foods state
  const [foods, setFoods] = useState<MealPresetFood[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableFoods, setAvailableFoods] = useState<FoodOption[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodOption | null>(null);
  const [customAmount, setCustomAmount] = useState('1');
  const [modalReady, setModalReady] = useState(false);

  // Temporary state for editing basic info
  const [tempPresetName, setTempPresetName] = useState('');
  const [tempPresetDescription, setTempPresetDescription] = useState('');
  const [tempSelectedEmoji, setTempSelectedEmoji] = useState('🍽️');
  
  // App data state
  const [appData, setAppData] = useState<AppData>({
    units: 'Metric',
    tdee: 'Mifflin-St Jeor',
  });

  // Load preset data if editing
  useEffect(() => {
    if (isEditing) {
      loadPresetData();
    }
    loadAvailableFoods();
  }, []);

  // Reset modal state when modal visibility changes
  useEffect(() => {
    if (showAddFoodModal) {
      const timer = setTimeout(() => {
        setModalReady(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setModalReady(false);
      setSelectedFood(null);
      setCustomAmount('1');
      setSearchQuery('');
    }
  }, [showAddFoodModal]);

  // Initialize temp values when edit info modal opens
  useEffect(() => {
    if (showEditInfoModal) {
      setTempPresetName(presetName);
      setTempPresetDescription(presetDescription);
      setTempSelectedEmoji(selectedEmoji);
    }
  }, [showEditInfoModal, presetName, presetDescription, selectedEmoji]);

  // Handle notification parameter from URL
  useEffect(() => {
    if (params.notification) {
      const message = decodeURIComponent(params.notification as string);
      setNotificationMessage(message);
      setShowNotification(true);
      // Clear the notification parameter from URL
      router.replace('/meal-preset' + (isEditing ? `?id=${params.id}` : ''));
    }
  }, [params.notification]);

  const loadPresetData = async () => {
    try {
      const presets = await mealPresetStorage.getMealPresets();
      const preset = presets.find(p => p.id === params.id);
      if (preset) {
        setPresetName(preset.name);
        setPresetDescription(preset.description);
        setSelectedEmoji(preset.emoji);
        setFoods(preset.foods);
      }
    } catch (error) {
      console.error('Error loading preset data:', error);
    }
  };

  const loadAvailableFoods = async () => {
    try {
      const [customFoods, storedAppData] = await Promise.all([
        customFoodStorage.getCustomFoods(),
        profileStorage.getAppData(),
      ]);
      setAppData(storedAppData);
      
      const defaultFoods: FoodOption[] = [
        {
          id: '1',
          name: 'Banana',
          image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400',
          caloriesPerServing: 105,
          proteinPerServing: 1.3,
          carbsPerServing: 27,
          fatPerServing: 0.3,
          servingSize: '1 medium',
          servingUnit: 'units',
          category: 'Fruits',
          isCustom: false,
        },
        {
          id: '2',
          name: 'Greek Yogurt',
          image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400',
          caloriesPerServing: 130,
          proteinPerServing: 20,
          carbsPerServing: 9,
          fatPerServing: 0,
          servingSize: '100g',
          servingUnit: 'grams',
          category: 'Dairy',
          isCustom: false,
        },
        {
          id: '3',
          name: 'Grilled Chicken Breast',
          image: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=400',
          caloriesPerServing: 231,
          proteinPerServing: 43.5,
          carbsPerServing: 0,
          fatPerServing: 5,
          servingSize: '100g',
          servingUnit: 'grams',
          category: 'Protein',
          isCustom: false,
        },
        {
          id: '4',
          name: 'Brown Rice',
          image: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400',
          caloriesPerServing: 216,
          proteinPerServing: 5,
          carbsPerServing: 45,
          fatPerServing: 1.8,
          servingSize: '1 cup cooked',
          servingUnit: 'units',
          category: 'Grains',
          isCustom: false,
        },
        {
          id: '5',
          name: 'Avocado',
          image: 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&w=400',
          caloriesPerServing: 234,
          proteinPerServing: 2.9,
          carbsPerServing: 12,
          fatPerServing: 21,
          servingSize: '1 medium',
          servingUnit: 'units',
          category: 'Fruits',
          isCustom: false,
        },
        {
          id: '6',
          name: 'Almonds',
          image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
          caloriesPerServing: 164,
          proteinPerServing: 6,
          carbsPerServing: 6,
          fatPerServing: 14,
          servingSize: '28g',
          servingUnit: 'grams',
          category: 'Nuts',
          isCustom: false,
        },
        {
          id: '7',
          name: 'Salmon Fillet',
          image: 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=400',
          caloriesPerServing: 206,
          proteinPerServing: 22,
          carbsPerServing: 0,
          fatPerServing: 12,
          servingSize: '100g',
          servingUnit: 'grams',
          category: 'Protein',
          isCustom: false,
        },
        {
          id: '8',
          name: 'Orange Juice',
          image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
          caloriesPerServing: 112,
          proteinPerServing: 1.7,
          carbsPerServing: 26,
          fatPerServing: 0.5,
          servingSize: '250ml',
          servingUnit: 'ml',
          category: 'Beverages',
          isCustom: false,
        },
      ];

      const customFoodOptions: FoodOption[] = customFoods.map(food => ({
        id: `custom_${food.id}`,
        name: food.name,
        emoji: food.emoji,
        caloriesPerServing: food.calories,
        proteinPerServing: food.protein,
        carbsPerServing: food.carbs,
        fatPerServing: food.fat,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        category: 'Custom Foods',
        isCustom: true,
      }));

      setAvailableFoods([...defaultFoods, ...customFoodOptions]);
    } catch (error) {
      console.error('Error loading available foods:', error);
    }
  };

  const calculateTotals = () => {
    return foods.reduce(
      (totals, food) => ({
        calories: totals.calories + (food.caloriesPerServing * food.servings),
        protein: totals.protein + (food.proteinPerServing * food.servings),
        carbs: totals.carbs + (food.carbsPerServing * food.servings),
        fat: totals.fat + (food.fatPerServing * food.servings),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleBack = () => {
    triggerHapticFeedback.light();
    if (currentPhase === 'foods' && !isEditing) {
      // Go back to basic info phase
      setCurrentPhase('basic');
    } else {
      // Go back to previous screen
      router.back();
    }
  };

  const handleContinue = () => {
    if (!presetName.trim()) {
      Alert.alert('Error', 'Please enter a preset name');
      return;
    }

    triggerHapticFeedback.light();
    setCurrentPhase('foods');
  };

  const handleEditInfo = () => {
    triggerHapticFeedback.light();
    setShowEditInfoModal(true);
  };

  const handleSaveBasicInfo = () => {
    if (!tempPresetName.trim()) {
      Alert.alert('Error', 'Please enter a preset name');
      return;
    }

    triggerHapticFeedback.success();
    setPresetName(tempPresetName.trim());
    setPresetDescription(tempPresetDescription.trim());
    setSelectedEmoji(tempSelectedEmoji);
    setShowEditInfoModal(false);
  };

  const handleCancelEditInfo = () => {
    triggerHapticFeedback.light();
    setShowEditInfoModal(false);
  };

  const handleDelete = () => {
    if (!isEditing) return;
    
    triggerHapticFeedback.warning();
    
    Alert.alert(
      'Delete Meal Preset',
      `Are you sure you want to delete "${presetName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await mealPresetStorage.deleteMealPreset(params.id as string);
              
              // Navigate back immediately
              router.back();
              
              // Navigate to appropriate page based on source with notification
              setTimeout(() => {
                const message = `${presetName} has been deleted!`;
                const source = params.source as string;
                
                if (source === 'diary') {
                  router.push(`/(tabs)/diary?notification=${encodeURIComponent(message)}`);
                } else {
                  // Default fallback to add page
                  router.push(`/(tabs)/add?notification=${encodeURIComponent(message)}`);
                }
              }, 100);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete meal preset. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!presetName.trim()) {
      Alert.alert('Error', 'Please enter a preset name');
      return;
    }

    if (foods.length === 0) {
      Alert.alert('Error', 'Please add at least one food item');
      return;
    }

    setIsSaving(true);
    triggerHapticFeedback.success();
    
    try {
      const totals = calculateTotals();
      const presetData = {
        name: presetName.trim(),
        description: presetDescription.trim(),
        emoji: selectedEmoji,
        foods,
        totalCalories: Math.round(totals.calories),
        totalProtein: Math.round(totals.protein * 10) / 10,
        totalCarbs: Math.round(totals.carbs * 10) / 10,
        totalFat: Math.round(totals.fat * 10) / 10,
      };

      if (isEditing) {
        await mealPresetStorage.updateMealPreset(params.id as string, presetData);
      } else {
        await mealPresetStorage.saveMealPreset(presetData);
      }
      
      // Navigate back immediately
      router.back();
      
      // Navigate to appropriate page based on source with notification
      setTimeout(() => {
        const message = isEditing ? `${presetName} has been updated!` : `${presetName} has been saved!`;
        const source = params.source as string;
        
        if (source === 'diary') {
          router.push(`/(tabs)/diary?notification=${encodeURIComponent(message)}`);
        } else {
          // Default fallback to add page
          router.push(`/(tabs)/add?notification=${encodeURIComponent(message)}`);
        }
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal preset. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmojiSelect = (emoji: string, isTemp: boolean = false) => {
    triggerHapticFeedback.light();
    if (isTemp) {
      setTempSelectedEmoji(emoji);
    } else {
      setSelectedEmoji(emoji);
    }
  };

  const handleFoodSelect = (foodOption: FoodOption) => {
    triggerHapticFeedback.light();
    setSelectedFood(foodOption);
    
    // Set initial amount based on serving unit and unit system
    if (foodOption.servingUnit === 'grams' && appData.units === 'Imperial') {
      // For Imperial units with grams, start with 1 oz converted to grams
      setCustomAmount((1 * 28.3495).toString());
    } else {
      setCustomAmount('1');
    }
  };

  const handleBackFromFoodSelection = () => {
    triggerHapticFeedback.light();
    if (selectedFood) {
      setSelectedFood(null);
      setCustomAmount('1');
    } else {
      setShowAddFoodModal(false);
    }
  };

  const adjustAmount = (increment: boolean) => {
    triggerHapticFeedback.light();
    const current = parseFloat(customAmount) || 1;
    
    let step: number;
    let min: number;
    
    if (selectedFood?.servingUnit === 'grams') {
      if (appData.units === 'Imperial') {
        // For Imperial units, use 0.1 oz steps (converted to grams for internal storage)
        step = 0.1 * 28.3495; // 0.1 oz in grams
        min = 0.1 * 28.3495; // 0.1 oz in grams
      } else {
        // For Metric units, use 10g steps
        step = 10;
        min = 10;
      }
    } else if (selectedFood?.servingUnit === 'ml') {
      step = 10;
      min = 10;
    } else {
      // For units
      step = 0.5;
      min = 0.5;
    }
    
    if (increment) {
      setCustomAmount((current + step).toString());
    } else if (current > min) {
      setCustomAmount((current - step).toString());
    }
  };

  const handleAddFoodToPreset = () => {
    if (!selectedFood) return;
    
    triggerHapticFeedback.success();
    const amount = parseFloat(customAmount) || 1;
    
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

    const newFood: MealPresetFood = {
      id: `${selectedFood.id}_${Date.now()}`,
      name: selectedFood.name,
      emoji: selectedFood.emoji,
      image: selectedFood.image,
      servings: multiplier,
      caloriesPerServing: selectedFood.caloriesPerServing,
      proteinPerServing: selectedFood.proteinPerServing,
      carbsPerServing: selectedFood.carbsPerServing,
      fatPerServing: selectedFood.fatPerServing,
      servingSize: selectedFood.servingSize,
      servingUnit: selectedFood.servingUnit,
      isCustom: selectedFood.isCustom,
    };

    setFoods([...foods, newFood]);
    setSelectedFood(null);
    setCustomAmount('1');
    setShowAddFoodModal(false);
  };

  const handleRemoveFood = (foodId: string) => {
    triggerHapticFeedback.light();
    setFoods(foods.filter(food => food.id !== foodId));
  };

  const handleUpdateServings = (foodId: string, servings: number) => {
    if (servings <= 0) return;
    
    triggerHapticFeedback.light();
    setFoods(foods.map(food => 
      food.id === foodId ? { ...food, servings } : food
    ));
  };

  const handleScanBarcode = () => {
    triggerHapticFeedback.light();
    router.push('/scanner');
  };

  const handleCreateCustomFood = () => {
    triggerHapticFeedback.light();
    router.push('/custom-food?source=meal-preset');
  };

  const filteredFoods = availableFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const totals = calculateTotals();

  // Edit Basic Info Modal
  const renderEditInfoModal = () => (
    <Modal
      visible={showEditInfoModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancelEditInfo}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalBackButton} onPress={handleCancelEditInfo}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.modalHeaderContent}>
            <Text style={styles.modalHeaderTitle}>Edit Preset Info</Text>
          </View>
          <TouchableOpacity 
            style={[styles.saveButton, !tempPresetName.trim() && styles.saveButtonDisabled]} 
            onPress={handleSaveBasicInfo}
            disabled={!tempPresetName.trim()}
          >
            <Save size={24} color={!tempPresetName.trim() ? "#666666" : "#22c55e"} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Preset name..."
              placeholderTextColor="#6b7280"
              value={tempPresetName}
              onChangeText={setTempPresetName}
              maxLength={50}
            />

            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="Description (optional)..."
              placeholderTextColor="#6b7280"
              value={tempPresetDescription}
              onChangeText={setTempPresetDescription}
              maxLength={100}
              multiline
            />
          </View>

          {/* Emoji Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Smile size={20} color="#22c55e" />
              <Text style={styles.sectionTitle}>Choose Icon</Text>
            </View>
            <View style={styles.selectedEmojiContainer}>
              <Text style={styles.selectedEmoji}>{tempSelectedEmoji}</Text>
              <Text style={styles.selectedEmojiLabel}>Selected Icon</Text>
            </View>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.emojiButton,
                    tempSelectedEmoji === emoji && styles.selectedEmojiButton
                  ]}
                  onPress={() => handleEmojiSelect(emoji, true)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Food Selection Modal Content
  const renderFoodSelectionModal = () => {
    if (!modalReady) {
      return (
        <View style={styles.modalLoadingContainer}>
          <Text style={styles.modalLoadingText}>Loading...</Text>
        </View>
      );
    }

    if (selectedFood) {
      const amount = parseFloat(customAmount) || 1;
      
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
      
      // Calculate macro values in grams first
      const proteinGrams = Math.round(selectedFood.proteinPerServing * multiplier * 10) / 10;
      const carbsGrams = Math.round(selectedFood.carbsPerServing * multiplier * 10) / 10;
      const fatGrams = Math.round(selectedFood.fatPerServing * multiplier * 10) / 10;
      
      // Convert to ounces if Imperial units are selected
      const totalProtein = appData.units === 'Imperial' 
        ? Math.round((proteinGrams / 28.3495) * 10) / 10 
        : proteinGrams;
      const totalCarbs = appData.units === 'Imperial' 
        ? Math.round((carbsGrams / 28.3495) * 10) / 10 
        : carbsGrams;
      const totalFat = appData.units === 'Imperial' 
        ? Math.round((fatGrams / 28.3495) * 10) / 10 
        : fatGrams;

      return (
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalBackButton} onPress={handleBackFromFoodSelection}>
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>Select Amount</Text>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
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

            <View style={styles.amountSection}>
              <Text style={styles.sectionTitle}>{getAmountLabel()}</Text>
              <View style={styles.amountControl}>
                <TouchableOpacity
                  style={styles.amountButton}
                  onPress={() => adjustAmount(false)}
                >
                  <Minus size={20} color="#ffffff" />
                </TouchableOpacity>
                <View style={styles.amountInputContainer}>
                  <TextInput
                    style={styles.amountInput}
                    value={selectedFood?.servingUnit === 'grams' && appData.units === 'Imperial' 
                      ? (Math.round((parseFloat(customAmount) / 28.3495) * 10) / 10).toString()
                      : customAmount}
                    onChangeText={(text) => {
                      if (selectedFood?.servingUnit === 'grams' && appData.units === 'Imperial') {
                        // Convert ounces input to grams for internal storage
                        const ounces = parseFloat(text) || 0;
                        setCustomAmount((ounces * 28.3495).toString());
                      } else {
                        setCustomAmount(text);
                      }
                    }}
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
                >
                  <Plus size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.amountDescription}>
                {getDisplayAmount(amount, selectedFood.servingUnit)}
              </Text>
            </View>

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

          <View style={styles.addButtonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddFoodToPreset}>
              <Text style={styles.addButtonText}>Add to Meal Preset</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalBackButton} onPress={handleBackFromFoodSelection}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.modalHeaderContent}>
            <Text style={styles.modalHeaderTitle}>Add Food</Text>
          </View>
          <TouchableOpacity style={styles.barcodeButton} onPress={handleScanBarcode}>
            <ScanLine size={24} color="#22c55e" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.plusButton} onPress={handleCreateCustomFood}>
            <Plus size={24} color="#22c55e" />
          </TouchableOpacity>
        </View>

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
  };

  // Phase 1: Basic Information
  if (currentPhase === 'basic') {
    return (
      <SafeAreaView style={styles.container}>
        <NotificationBanner
          visible={showNotification}
          message={notificationMessage}
          onHide={() => setShowNotification(false)}
        />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Create Meal Preset</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Preset name..."
              placeholderTextColor="#6b7280"
              value={presetName}
              onChangeText={setPresetName}
              maxLength={50}
            />

            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="Description (optional)..."
              placeholderTextColor="#6b7280"
              value={presetDescription}
              onChangeText={setPresetDescription}
              maxLength={100}
              multiline
            />
          </View>

          {/* Emoji Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Smile size={20} color="#22c55e" />
              <Text style={styles.sectionTitle}>Choose Icon</Text>
            </View>
            <View style={styles.selectedEmojiContainer}>
              <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
              <Text style={styles.selectedEmojiLabel}>Selected Icon</Text>
            </View>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.selectedEmojiButton
                  ]}
                  onPress={() => handleEmojiSelect(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.continueButtonContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !presetName.trim() && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!presetName.trim()}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Phase 2: Foods Management
  return (
    <SafeAreaView style={styles.container}>
      <NotificationBanner
        visible={showNotification}
        message={notificationMessage}
        onHide={() => setShowNotification(false)}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Meal Preset' : presetName}
          </Text>
          {!isEditing && (
            <Text style={styles.headerSubtitle}>Add foods to your preset</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {isEditing && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDelete}
            >
              <Trash2 size={24} color="#ef4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            <Save size={24} color={isSaving ? "#666666" : "#22c55e"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preset Info Summary */}
        <TouchableOpacity style={styles.presetSummary} onPress={handleEditInfo}>
          <View style={styles.presetSummaryIcon}>
            <Text style={styles.presetSummaryEmoji}>{selectedEmoji}</Text>
          </View>
          <View style={styles.presetSummaryInfo}>
            <Text style={styles.presetSummaryName}>{presetName}</Text>
            {presetDescription && (
              <Text style={styles.presetSummaryDescription}>{presetDescription}</Text>
            )}
          </View>
          <View style={styles.editInfoButton}>
            <Edit size={20} color="#22c55e" />
          </View>
        </TouchableOpacity>

        {/* Totals */}
        {foods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutritional Totals</Text>
            <View style={styles.totalsCard}>
              <View style={styles.totalsGrid}>
                <View style={styles.totalItem}>
                  <Text style={styles.totalValue}>{Math.round(totals.calories)}</Text>
                  <Text style={styles.totalLabel}>Calories</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalValue}>{Math.round(totals.protein * 10) / 10}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                  <Text style={styles.totalLabel}>Protein</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalValue}>{Math.round(totals.carbs * 10) / 10}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                  <Text style={styles.totalLabel}>Carbs</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalValue}>{Math.round(totals.fat * 10) / 10}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                  <Text style={styles.totalLabel}>Fat</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Foods */}
        <View style={styles.section}>
          <View style={styles.foodsHeader}>
            <Text style={styles.sectionTitle}>Foods ({foods.length})</Text>
            <TouchableOpacity 
              style={styles.addFoodButton}
              onPress={() => setShowAddFoodModal(true)}
            >
              <Plus size={20} color="#22c55e" />
              <Text style={styles.addFoodButtonText}>Add Food</Text>
            </TouchableOpacity>
          </View>

          {foods.length === 0 ? (
            <View style={styles.emptyFoodsContainer}>
              <Text style={styles.emptyFoodsEmoji}>🍽️</Text>
              <Text style={styles.emptyFoodsTitle}>No Foods Added</Text>
              <Text style={styles.emptyFoodsSubtext}>
                Add foods to create your meal preset
              </Text>
            </View>
          ) : (
            foods.map((food) => (
              <View key={food.id} style={styles.foodItemContainer}>
                <View style={styles.foodItemHeader}>
                  {food.isCustom ? (
                    <View style={styles.customFoodIcon}>
                      <Text style={styles.customFoodEmoji}>{food.emoji}</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: food.image }} style={styles.foodItemImage} />
                  )}
                  <View style={styles.foodItemInfo}>
                    <Text style={styles.foodItemName}>{food.name}</Text>
                    <Text style={styles.foodItemServing}>
                      {food.servingSize} {food.servingUnit === 'units' ? '' : food.servingUnit}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeFoodButton}
                    onPress={() => handleRemoveFood(food.id)}
                  >
                    <X size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.servingsControl}>
                  <TouchableOpacity
                    style={styles.servingsButton}
                    onPress={() => handleUpdateServings(food.id, food.servings - 0.5)}
                  >
                    <Minus size={16} color="#ffffff" />
                  </TouchableOpacity>
                  <Text style={styles.servingsText}>{food.servings}</Text>
                  <TouchableOpacity
                    style={styles.servingsButton}
                    onPress={() => handleUpdateServings(food.id, food.servings + 0.5)}
                  >
                    <Plus size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.foodNutrition}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(food.caloriesPerServing * food.servings)}
                    </Text>
                    <Text style={styles.nutritionLabel}>cal</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(food.proteinPerServing * food.servings * 10) / 10}{appData.units === 'Imperial' ? 'oz' : 'g'}
                    </Text>
                    <Text style={styles.nutritionLabel}>protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(food.carbsPerServing * food.servings * 10) / 10}{appData.units === 'Imperial' ? 'oz' : 'g'}
                    </Text>
                    <Text style={styles.nutritionLabel}>carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(food.fatPerServing * food.servings * 10) / 10}{appData.units === 'Imperial' ? 'oz' : 'g'}
                    </Text>
                    <Text style={styles.nutritionLabel}>fat</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Basic Info Modal */}
      {renderEditInfoModal()}

      {/* Food Selection Modal */}
      <Modal
        visible={showAddFoodModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowAddFoodModal(false)}
      >
        {renderFoodSelectionModal()}
      </Modal>
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    marginLeft: 8,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectedEmojiContainer: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  selectedEmojiLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: '12%',
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedEmojiButton: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  emojiText: {
    fontSize: 20,
  },
  continueButtonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#333333',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  presetSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  presetSummaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  presetSummaryEmoji: {
    fontSize: 28,
  },
  presetSummaryInfo: {
    flex: 1,
  },
  presetSummaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  presetSummaryDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  editInfoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  addFoodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    marginLeft: 8,
  },
  emptyFoodsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  emptyFoodsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyFoodsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyFoodsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  foodItemContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  foodItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#2a2a2a',
  },
  customFoodIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customFoodEmoji: {
    fontSize: 24,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  foodItemServing: {
    fontSize: 14,
    color: '#9ca3af',
  },
  removeFoodButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  servingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  foodNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  totalsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  totalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  totalLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  modalLoadingText: {
    fontSize: 16,
    color: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalHeaderTitle: {
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
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
  // Amount Selection Styles
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