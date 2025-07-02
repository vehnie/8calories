import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { ArrowLeft, Save, Smile, Trash2 } from 'lucide-react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { NotificationBanner } from '@/components/NotificationBanner';
import { triggerHapticFeedback } from '@/utils/haptics';
import { customFoodStorage, CustomFood, profileStorage, AppData } from '@/utils/storage';

const EMOJI_OPTIONS = [
  '🍎', '🍌', '🥑', '🍞', '🥛', '🧀', '🥩', '🐟',
  '🍗', '🥚', '🥜', '🌾', '🍚', '🍝', '🥗', '🥕',
  '🥦', '🍅', '🥒', '🌽', '🥔', '🍠', '🫐', '🍓',
  '🍇', '🍊', '🥭', '🍑', '🥝', '🍍', '🥥', '🍋',
  '🫒', '🌰', '🥖', '🥨', '🧈', '🍯', '🥤', '☕',
];

export default function CustomFoodScreen() {
  const params = useLocalSearchParams();
  const isEditing = !!params.id;
  
  // Phase management
  const [currentPhase, setCurrentPhase] = useState<'basic' | 'nutrition'>(isEditing ? 'nutrition' : 'basic');
  
  const [foodName, setFoodName] = useState(params.name as string || '');
  const [selectedEmoji, setSelectedEmoji] = useState(params.emoji as string || '🍎');
  const [servingSize, setServingSize] = useState(params.servingSize as string || '');
  const [servingUnit, setServingUnit] = useState<'grams' | 'ml' | 'units'>(
    (params.servingUnit as 'grams' | 'ml' | 'units') || 'grams'
  );
  const [calories, setCalories] = useState(params.calories as string || '');
  const [protein, setProtein] = useState(params.protein as string || '');
  const [carbs, setCarbs] = useState(params.carbs as string || '');
  const [fat, setFat] = useState(params.fat as string || '');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [appData, setAppData] = useState<AppData>({
    units: 'Metric',
    tdee: 'Mifflin-St Jeor',
  });
  const previousUnitsRef = useRef<string>('Metric');

  const loadData = async () => {
    try {
      const storedAppData = await profileStorage.getAppData();
      setAppData(storedAppData);
      previousUnitsRef.current = storedAppData.units; // Set initial units reference
      
      // If editing and in Imperial mode, convert initial values from grams to ounces for display
      if (isEditing && storedAppData.units === 'Imperial') {
        if (params.protein) setProtein(convertValue(params.protein as string, true));
        if (params.carbs) setCarbs(convertValue(params.carbs as string, true));
        if (params.fat) setFat(convertValue(params.fat as string, true));
        // Convert serving size if it's in grams
        if (params.servingUnit === 'grams' && params.servingSize) {
          setServingSize(convertValue(params.servingSize as string, true));
        }
      }
    } catch (error) {
      console.error('Error loading app data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload app data when screen comes into focus to detect unit changes
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const convertValue = (value: string, toImperial: boolean) => {
    if (!value || isNaN(parseFloat(value))) return value;
    const numValue = parseFloat(value);
    if (toImperial) {
      // Convert grams to ounces
      return (numValue / 28.3495).toFixed(1);
    } else {
      // Convert ounces to grams
      return (numValue * 28.3495).toFixed(1);
    }
  };

  // Convert nutritional values when unit system changes
  useEffect(() => {
    // Only convert if the unit system actually changed and we have values
    if (previousUnitsRef.current !== appData.units && previousUnitsRef.current !== null) {
      const isImperial = appData.units === 'Imperial';
      
      if (isImperial) {
        // Converting to Imperial: convert current values from grams to ounces for display
        if (protein) setProtein(convertValue(protein, true));
        if (carbs) setCarbs(convertValue(carbs, true));
        if (fat) setFat(convertValue(fat, true));
        // Convert serving size if it's in grams
        if (servingUnit === 'grams' && servingSize) {
          setServingSize(convertValue(servingSize, true));
        }
      } else {
        // Converting to Metric: convert current values from ounces to grams
        if (protein) setProtein(convertValue(protein, false));
        if (carbs) setCarbs(convertValue(carbs, false));
        if (fat) setFat(convertValue(fat, false));
        // Convert serving size if it's in grams
        if (servingUnit === 'grams' && servingSize) {
          setServingSize(convertValue(servingSize, false));
        }
      }
      
      // Update the previous units reference
      previousUnitsRef.current = appData.units;
    }
  }, [appData.units]);

  const handleBack = () => {
    triggerHapticFeedback.light();
    if (currentPhase === 'nutrition' && !isEditing) {
      // Go back to basic info phase
      setCurrentPhase('basic');
    } else {
      // Go back to previous screen
      router.back();
    }
  };

  const handleContinue = () => {
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    triggerHapticFeedback.light();
    setCurrentPhase('nutrition');
  };

  const handleDelete = () => {
    if (!isEditing) return;
    
    triggerHapticFeedback.warning();
    
    Alert.alert(
      'Delete Custom Food',
      `Are you sure you want to delete "${foodName}"? This action cannot be undone.`,
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
              await customFoodStorage.deleteCustomFood(params.id as string);
              
              // Navigate back immediately
              router.back();
              
              // Navigate to appropriate page based on source with notification
              setTimeout(() => {
                const message = `${foodName} has been deleted!`;
                const source = params.source as string;
                
                if (source === 'add') {
                  router.push(`/(tabs)/add?notification=${encodeURIComponent(message)}`);
                } else if (source === 'diary') {
                  router.push(`/(tabs)/diary?notification=${encodeURIComponent(message)}`);
                } else if (source === 'meal-preset') {
                  router.push(`/meal-preset?notification=${encodeURIComponent(message)}`);
                } else {
                  // Default fallback to add page
                  router.push(`/(tabs)/add?notification=${encodeURIComponent(message)}`);
                }
              }, 100);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete custom food. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    // Validation
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }
    
    if (!servingSize.trim()) {
      Alert.alert('Error', 'Please enter a serving size');
      return;
    }
    
    if (!calories.trim() || !protein.trim() || !carbs.trim() || !fat.trim()) {
      Alert.alert('Error', 'Please fill in all nutritional information');
      return;
    }

    // Validate numbers
    const numericFields = [calories, protein, carbs, fat];
    const isValidNumbers = numericFields.every(field => {
      const num = parseFloat(field);
      return !isNaN(num) && num >= 0;
    });

    if (!isValidNumbers) {
      Alert.alert('Error', 'Please enter valid numbers for nutritional information');
      return;
    }

    setIsSaving(true);
    triggerHapticFeedback.success();
    
    try {
      // Convert nutritional values back to grams for storage if in Imperial mode
      const proteinValue = appData.units === 'Imperial' ? parseFloat(convertValue(protein, false)) : parseFloat(protein);
      const carbsValue = appData.units === 'Imperial' ? parseFloat(convertValue(carbs, false)) : parseFloat(carbs);
      const fatValue = appData.units === 'Imperial' ? parseFloat(convertValue(fat, false)) : parseFloat(fat);
      // Convert serving size back to grams for storage if in Imperial mode and serving unit is grams
      const servingSizeValue = (appData.units === 'Imperial' && servingUnit === 'grams') ? convertValue(servingSize, false) : servingSize;
      
      const foodData = {
          name: foodName.trim(),
          emoji: selectedEmoji,
          servingSize: servingSizeValue.trim(),
          servingUnit,
          calories: parseFloat(calories),
          protein: proteinValue,
          carbs: carbsValue,
          fat: fatValue,
        };

      if (isEditing) {
        await customFoodStorage.updateCustomFood(params.id as string, foodData);
      } else {
        await customFoodStorage.saveCustomFood(foodData);
      }
      
      // Navigate back immediately
      router.back();
      
      // Navigate to appropriate page based on source with notification
      setTimeout(() => {
        const message = isEditing ? `${foodName} has been updated!` : `${foodName} has been saved to your custom foods!`;
        const source = params.source as string;
        
        if (source === 'add') {
          router.push(`/(tabs)/add?notification=${encodeURIComponent(message)}`);
        } else if (source === 'diary') {
          router.push(`/(tabs)/diary?notification=${encodeURIComponent(message)}`);
        } else if (source === 'meal-preset') {
          router.push(`/meal-preset?notification=${encodeURIComponent(message)}`);
        } else {
          // Default fallback to add page
          router.push(`/(tabs)/add?notification=${encodeURIComponent(message)}`);
        }
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to save custom food. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnitChange = (unit: 'grams' | 'ml' | 'units') => {
    triggerHapticFeedback.light();
    setServingUnit(unit);
  };

  const handleEmojiSelect = (emoji: string) => {
    triggerHapticFeedback.light();
    setSelectedEmoji(emoji);
  };

  const getUnitLabel = () => {
    switch (servingUnit) {
      case 'grams':
        return 'g';
      case 'ml':
        return 'ml';
      case 'units':
        return 'unit(s)';
      default:
        return 'g';
    }
  };

  const getNutritionUnitLabel = () => {
    return appData.units === 'Imperial' ? 'oz' : 'g';
  };

  const getDisplayUnitLabel = () => {
    switch (servingUnit) {
      case 'grams':
        return appData.units === 'Imperial' ? 'oz' : 'g';
      case 'ml':
        return 'ml';
      case 'units':
        return 'unit(s)';
      default:
        return appData.units === 'Imperial' ? 'oz' : 'g';
    }
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
            <Text style={styles.headerTitle}>Create Custom Food</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Food name..."
              placeholderTextColor="#6b7280"
              value={foodName}
              onChangeText={setFoodName}
              maxLength={50}
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
            style={[styles.continueButton, !foodName.trim() && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!foodName.trim()}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Phase 2: Nutrition Information
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
            {isEditing ? 'Edit Custom Food' : foodName}
          </Text>
          {!isEditing && (
            <Text style={styles.headerSubtitle}>Add serving size and nutrition info</Text>
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
        {/* Food Summary */}
        {!isEditing && (
          <View style={styles.foodSummary}>
            <View style={styles.foodSummaryIcon}>
              <Text style={styles.foodSummaryEmoji}>{selectedEmoji}</Text>
            </View>
            <View style={styles.foodSummaryInfo}>
              <Text style={styles.foodSummaryName}>{foodName}</Text>
            </View>
          </View>
        )}

        {/* Food Name - Only show in editing mode */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter food name..."
              placeholderTextColor="#6b7280"
              value={foodName}
              onChangeText={setFoodName}
              maxLength={50}
            />
          </View>
        )}

        {/* Emoji Selection - Only show in editing mode */}
        {isEditing && (
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
        )}

        {/* Serving Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serving Size</Text>
          
          {/* Unit Selection */}
          <View style={styles.unitSelector}>
            {(['grams', 'ml', 'units'] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitButton,
                  servingUnit === unit && styles.selectedUnitButton
                ]}
                onPress={() => handleUnitChange(unit)}
              >
                <Text style={[
                  styles.unitButtonText,
                  servingUnit === unit && styles.selectedUnitButtonText
                ]}>
                  {unit === 'grams' ? (appData.units === 'Imperial' ? 'Ounces' : 'Grams') : unit === 'ml' ? 'Milliliters' : 'Units'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Serving Size Input */}
          <View style={styles.servingSizeContainer}>
            <TextInput
              style={styles.servingSizeInput}
              placeholder="100"
              placeholderTextColor="#6b7280"
              value={servingSize}
              onChangeText={setServingSize}
              keyboardType="numeric"
            />
            <Text style={styles.servingSizeUnit}>{getDisplayUnitLabel()}</Text>
          </View>
        </View>

        {/* Nutritional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutritional Information</Text>
          <Text style={styles.sectionSubtitle}>
            Per {servingSize || '100'} {getDisplayUnitLabel()}
          </Text>
          
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <View style={styles.nutritionInputContainer}>
                <TextInput
                  style={styles.nutritionInput}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                />
                <Text style={styles.nutritionUnit}>kcal</Text>
              </View>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <View style={styles.nutritionInputContainer}>
                <TextInput
                  style={styles.nutritionInput}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                />
                <Text style={styles.nutritionUnit}>{getNutritionUnitLabel()}</Text>
              </View>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <View style={styles.nutritionInputContainer}>
                <TextInput
                  style={styles.nutritionInput}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                />
                <Text style={styles.nutritionUnit}>{getNutritionUnitLabel()}</Text>
              </View>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <View style={styles.nutritionInputContainer}>
                <TextInput
                  style={styles.nutritionInput}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                />
                <Text style={styles.nutritionUnit}>{getNutritionUnitLabel()}</Text>
              </View>
            </View>
          </View>
        </View>



        <View style={{ height: 300 }} />
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    marginTop: -8,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333333',
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
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedUnitButton: {
    backgroundColor: '#22c55e',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  selectedUnitButtonText: {
    color: '#ffffff',
  },
  servingSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  servingSizeInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  servingSizeUnit: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 8,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    marginBottom: 16,
  },
  nutritionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  nutritionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  nutritionInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  nutritionUnit: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
  },

  // Continue Button Styles
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
  // Food Summary Styles
  foodSummary: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  foodSummaryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  foodSummaryEmoji: {
    fontSize: 28,
  },
  foodSummaryInfo: {
    flex: 1,
  },
  foodSummaryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});