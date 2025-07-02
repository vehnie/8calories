import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyMealEntry {
  id: string;
  foodId: string;
  foodName: string;
  emoji?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  amount: number;
  servingUnit: 'grams' | 'ml' | 'units';
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD format
  addedAt: string; // ISO timestamp
}

export interface CustomFood {
  id: string;
  name: string;
  emoji: string;
  servingSize: string;
  servingUnit: 'grams' | 'ml' | 'units';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

export interface MealPresetFood {
  id: string;
  name: string;
  emoji?: string;
  image?: string;
  servings: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  servingSize: string;
  servingUnit: 'grams' | 'ml' | 'units';
  isCustom: boolean;
}

export interface MealPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  foods: MealPresetFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
}

const CUSTOM_FOODS_KEY = 'custom_foods';
const MEAL_PRESETS_KEY = 'meal_presets';
const DAILY_MEALS_KEY = 'daily_meals';
const PROFILE_DATA_KEY = 'profile_data';
const APP_DATA_KEY = 'app_data';
const SETUP_COMPLETE_KEY = 'setup_complete';

export interface ProfileData {
  activity: string;
  goal: string;
  weight: string;
  height: string;
  age: string;
  gender: string;
}

export interface AppData {
  units: string;
  tdee: string;
}

export const customFoodStorage = {
  async getCustomFoods(): Promise<CustomFood[]> {
    try {
      const data = await AsyncStorage.getItem(CUSTOM_FOODS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading custom foods:', error);
      return [];
    }
  },

  async getAllCustomFoods(): Promise<CustomFood[]> {
    return this.getCustomFoods();
  },

  async saveCustomFood(food: Omit<CustomFood, 'id' | 'createdAt'>): Promise<CustomFood> {
    try {
      const existingFoods = await this.getCustomFoods();
      const newFood: CustomFood = {
        ...food,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      const updatedFoods = [...existingFoods, newFood];
      await AsyncStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(updatedFoods));
      
      return newFood;
    } catch (error) {
      console.error('Error saving custom food:', error);
      throw error;
    }
  },

  async updateCustomFood(id: string, updates: Partial<CustomFood>): Promise<void> {
    try {
      const existingFoods = await this.getCustomFoods();
      const updatedFoods = existingFoods.map(food =>
        food.id === id ? { ...food, ...updates } : food
      );
      
      await AsyncStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(updatedFoods));
    } catch (error) {
      console.error('Error updating custom food:', error);
      throw error;
    }
  },

  async deleteCustomFood(id: string): Promise<void> {
    try {
      const existingFoods = await this.getCustomFoods();
      const filteredFoods = existingFoods.filter(food => food.id !== id);
      
      await AsyncStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(filteredFoods));
    } catch (error) {
      console.error('Error deleting custom food:', error);
      throw error;
    }
  },
};

export const dailyMealStorage = {
  async getDailyMeals(date?: string): Promise<DailyMealEntry[]> {
    try {
      const data = await AsyncStorage.getItem(DAILY_MEALS_KEY);
      const allMeals: DailyMealEntry[] = data ? JSON.parse(data) : [];
      
      if (date) {
        return allMeals.filter(meal => meal.date === date);
      }
      
      return allMeals;
    } catch (error) {
      console.error('Error loading daily meals:', error);
      return [];
    }
  },

  async getAllMeals(): Promise<DailyMealEntry[]> {
    return this.getDailyMeals();
  },

  async saveMeal(date: string, meals: DailyMealEntry[]): Promise<void> {
    try {
      const allMeals = await this.getDailyMeals();
      const filteredMeals = allMeals.filter(meal => meal.date !== date);
      const updatedMeals = [...filteredMeals, ...meals];
      await AsyncStorage.setItem(DAILY_MEALS_KEY, JSON.stringify(updatedMeals));
    } catch (error) {
      console.error('Error saving meals for date:', error);
      throw error;
    }
  },

  async getTodaysMeals(): Promise<DailyMealEntry[]> {
    // Use local date to avoid timezone issues
    const todayDate = new Date();
    const today = todayDate.getFullYear() + '-' + 
      String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(todayDate.getDate()).padStart(2, '0');
    return this.getDailyMeals(today);
  },

  async addMealEntry(entry: Omit<DailyMealEntry, 'id' | 'addedAt'>): Promise<DailyMealEntry> {
    try {
      const existingMeals = await this.getDailyMeals();
      const newEntry: DailyMealEntry = {
        ...entry,
        id: Date.now().toString(),
        addedAt: new Date().toISOString(),
      };
      
      const updatedMeals = [...existingMeals, newEntry];
      await AsyncStorage.setItem(DAILY_MEALS_KEY, JSON.stringify(updatedMeals));
      
      return newEntry;
    } catch (error) {
      console.error('Error adding meal entry:', error);
      throw error;
    }
  },

  async deleteMealEntry(id: string): Promise<void> {
    try {
      const existingMeals = await this.getDailyMeals();
      const filteredMeals = existingMeals.filter(meal => meal.id !== id);
      
      await AsyncStorage.setItem(DAILY_MEALS_KEY, JSON.stringify(filteredMeals));
    } catch (error) {
      console.error('Error deleting meal entry:', error);
      throw error;
    }
  },

  async getMealsByType(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', date?: string): Promise<DailyMealEntry[]> {
    const meals = await this.getDailyMeals(date);
    return meals.filter(meal => meal.mealType === mealType);
  },

  async getTodaysMealsByType(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'): Promise<DailyMealEntry[]> {
    // Use local date to avoid timezone issues
    const todayDate = new Date();
    const today = todayDate.getFullYear() + '-' + 
      String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(todayDate.getDate()).padStart(2, '0');
    return this.getMealsByType(mealType, today);
  },

  async updateMealEntry(id: string, updates: Partial<DailyMealEntry>): Promise<void> {
    try {
      const existingMeals = await this.getDailyMeals();
      const updatedMeals = existingMeals.map(meal =>
        meal.id === id ? { ...meal, ...updates } : meal
      );
      
      await AsyncStorage.setItem(DAILY_MEALS_KEY, JSON.stringify(updatedMeals));
    } catch (error) {
      console.error('Error updating meal entry:', error);
      throw error;
    }
  },

  async updateMealAmount(id: string, newAmount: number, originalEntry: DailyMealEntry): Promise<void> {
    try {
      // Calculate new nutritional values based on the new amount
      const ratio = newAmount / originalEntry.amount;
      
      const updates: Partial<DailyMealEntry> = {
        amount: newAmount,
        calories: Math.round(originalEntry.calories * ratio),
        protein: Math.round(originalEntry.protein * ratio),
        carbs: Math.round(originalEntry.carbs * ratio),
        fat: Math.round(originalEntry.fat * ratio),
      };
      
      await this.updateMealEntry(id, updates);
    } catch (error) {
      console.error('Error updating meal amount:', error);
      throw error;
    }
  },
};

export const mealPresetStorage = {
  async getMealPresets(): Promise<MealPreset[]> {
    try {
      const data = await AsyncStorage.getItem(MEAL_PRESETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading meal presets:', error);
      return [];
    }
  },

  async getAllMealPresets(): Promise<MealPreset[]> {
    return this.getMealPresets();
  },

  async saveMealPreset(preset: Omit<MealPreset, 'id' | 'createdAt'>): Promise<MealPreset> {
    try {
      const existingPresets = await this.getMealPresets();
      const newPreset: MealPreset = {
        ...preset,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      const updatedPresets = [...existingPresets, newPreset];
      await AsyncStorage.setItem(MEAL_PRESETS_KEY, JSON.stringify(updatedPresets));
      
      return newPreset;
    } catch (error) {
      console.error('Error saving meal preset:', error);
      throw error;
    }
  },

  async updateMealPreset(id: string, updates: Partial<MealPreset>): Promise<void> {
    try {
      const existingPresets = await this.getMealPresets();
      const updatedPresets = existingPresets.map(preset =>
        preset.id === id ? { ...preset, ...updates } : preset
      );
      
      await AsyncStorage.setItem(MEAL_PRESETS_KEY, JSON.stringify(updatedPresets));
    } catch (error) {
      console.error('Error updating meal preset:', error);
      throw error;
    }
  },

  async deleteMealPreset(id: string): Promise<void> {
    try {
      const existingPresets = await this.getMealPresets();
      const filteredPresets = existingPresets.filter(preset => preset.id !== id);
      
      await AsyncStorage.setItem(MEAL_PRESETS_KEY, JSON.stringify(filteredPresets));
    } catch (error) {
      console.error('Error deleting meal preset:', error);
      throw error;
    }
  },
};

export const profileStorage = {
  async getProfileData(): Promise<ProfileData> {
    try {
      const data = await AsyncStorage.getItem(PROFILE_DATA_KEY);
      return data ? JSON.parse(data) : {
        activity: 'Moderately Active',
        goal: 'Lose Weight',
        weight: '70',
        height: '175',
        age: '28',
        gender: 'Male',
      };
    } catch (error) {
      console.error('Error loading profile data:', error);
      return {
        activity: 'Moderately Active',
        goal: 'Lose Weight',
        weight: '70',
        height: '175',
        age: '28',
        gender: 'Male',
      };
    }
  },

  async saveProfileData(profileData: ProfileData): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(profileData));
    } catch (error) {
      console.error('Error saving profile data:', error);
      throw error;
    }
  },

  async getAppData(): Promise<AppData> {
    try {
      const data = await AsyncStorage.getItem(APP_DATA_KEY);
      return data ? JSON.parse(data) : {
        units: 'Metric',
        tdee: 'Mifflin-St Jeor',
      };
    } catch (error) {
      console.error('Error loading app data:', error);
      return {
        units: 'Metric',
        tdee: 'Mifflin-St Jeor',
      };
    }
  },

  async saveAppData(appData: AppData): Promise<void> {
    try {
      await AsyncStorage.setItem(APP_DATA_KEY, JSON.stringify(appData));
    } catch (error) {
      console.error('Error saving app data:', error);
      throw error;
    }
  },

  async getSetupStatus(): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(SETUP_COMPLETE_KEY);
      if (!data) return 0;
      
      // Handle legacy boolean values
      if (data === 'true') return 1;
      if (data === 'false') return 0;
      
      // Parse numeric values
      const parsed = parseInt(data, 10);
      return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
      console.error('Error checking setup status:', error);
      return 0;
    }
  },

  async setSetupStatus(status: number): Promise<void> {
    try {
      await AsyncStorage.setItem(SETUP_COMPLETE_KEY, status.toString());
    } catch (error) {
      console.error('Error setting setup status:', error);
      throw error;
    }
  },

  // Legacy function for backward compatibility
  async isSetupComplete(): Promise<boolean> {
    const status = await this.getSetupStatus();
    return status === 1;
  },

  // Legacy function for backward compatibility
  async setSetupComplete(complete: boolean): Promise<void> {
    await this.setSetupStatus(complete ? 1 : 0);
  },

  // Utility function for testing - clears setup status to force setup page
  async clearSetupStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETUP_COMPLETE_KEY);
      console.log('Setup status cleared - app will show setup page on next launch');
    } catch (error) {
      console.error('Error clearing setup status:', error);
      throw error;
    }
  },

  // Utility function for testing - clears all app data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        SETUP_COMPLETE_KEY,
        PROFILE_DATA_KEY,
        APP_DATA_KEY,
        DAILY_MEALS_KEY,
        CUSTOM_FOODS_KEY,
        MEAL_PRESETS_KEY
      ]);
      console.log('All app data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },
};