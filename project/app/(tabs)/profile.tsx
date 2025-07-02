import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Linking,
} from 'react-native';
import { Settings, User, Activity, Target, Scale, Ruler, Calendar, Users, Globe, Calculator, Download, Upload, FileText, Bug, Info, Beef, Wheat, Droplet } from 'lucide-react-native';
import { triggerHapticFeedback } from '@/utils/haptics';
import { EditProfileModal } from '@/components/EditProfileModal';
import { EditAppSettingsModal } from '@/components/EditAppSettingsModal';
import { profileStorage, ProfileData, AppData, dailyMealStorage, customFoodStorage, mealPresetStorage } from '@/utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<any>(null);
  const [appSettingsModalVisible, setAppSettingsModalVisible] = useState(false);
  const [selectedAppSetting, setSelectedAppSetting] = useState<any>(null);
  const [disclaimerModalVisible, setDisclaimerModalVisible] = useState(false);
  const [bugReportModalVisible, setBugReportModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
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

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );

  // Convert weight and height for display
  const getDisplayWeight = () => {
    // Profile data is now stored in the same units as the current unit system
    return profileData.weight;
  };

  const getDisplayHeight = () => {
    // Profile data is now stored in the same units as the current unit system
    return profileData.height;
  };

  const profileSettings = [
    { icon: Activity, label: 'Activity', value: profileData.activity, type: 'activity', color: '#22c55e' },
    { icon: Target, label: 'Goal', value: profileData.goal, type: 'goal', color: '#3b82f6' },
    { icon: Scale, label: 'Weight', value: `${getDisplayWeight()} ${appData.units === 'Imperial' ? 'lbs' : 'kg'}`, type: 'weight', color: '#f59e0b' },
    { icon: Ruler, label: 'Height', value: `${getDisplayHeight()} ${appData.units === 'Imperial' ? 'in' : 'cm'}`, type: 'height', color: '#8b5cf6' },
    { icon: Calendar, label: 'Age', value: `${profileData.age} years`, type: 'age', color: '#6b7280' },
    { icon: Users, label: 'Gender', value: profileData.gender, type: 'gender', color: '#ec4899' },
  ];

  const appSettings = [
    { icon: Globe, label: 'Units', value: appData.units, type: 'units', color: '#22c55e' },
    { icon: Calculator, label: 'TDEE equation', value: appData.tdee, type: 'tdee', color: '#3b82f6' },
    { icon: Download, label: 'Export data', value: '', type: 'export', color: '#f59e0b' },
    { icon: Upload, label: 'Import data', value: '', type: 'import', color: '#8b5cf6' },
    { icon: FileText, label: 'Disclaimer', value: '', type: 'disclaimer', color: '#6b7280' },
    { icon: Bug, label: 'Report Bug', value: '', type: 'bug', color: '#ef4444' },
    { icon: Info, label: 'About', value: '', type: 'about', color: '#6b7280' },
  ];

  const handleProfileSettingPress = (setting: any) => {
    triggerHapticFeedback.light();
    setSelectedSetting({
      label: setting.label,
      value: setting.type === 'weight' ? profileData.weight :
             setting.type === 'height' ? profileData.height :
             setting.type === 'age' ? profileData.age :
             setting.value,
      type: setting.type
    });
    setEditModalVisible(true);
  };

  const handleSaveProfileSetting = async (type: string, newValue: string) => {
    const updatedProfileData = {
      ...profileData,
      [type]: newValue
    };
    setProfileData(updatedProfileData);
    try {
      await profileStorage.saveProfileData(updatedProfileData);
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  const handleAppSettingPress = (setting: any) => {
    triggerHapticFeedback.light();
    
    // Handle settings that need modals
    if (setting.type === 'units' || setting.type === 'tdee') {
      setSelectedAppSetting({
        label: setting.label,
        value: setting.value,
        type: setting.type
      });
      setAppSettingsModalVisible(true);
    } else {
      // Handle other settings (export, import, etc.)
      handleOtherAppSettings(setting.type);
    }
  };

  const handleSaveAppSetting = async (type: string, newValue: string) => {
    const updatedAppData = {
      ...appData,
      [type]: newValue
    };
    
    // If changing units, convert stored profile data to match the new unit system
    if (type === 'units') {
      let updatedProfileData = { ...profileData };
      
      // Convert stored values to match the new unit system
      if (appData.units === 'Imperial' && newValue === 'Metric') {
        // Converting from Imperial to Metric: stored values are in Imperial, convert to metric
        if (profileData.weight && !isNaN(parseFloat(profileData.weight))) {
          const weightKg = parseFloat(profileData.weight) / 2.20462;
          updatedProfileData.weight = weightKg.toFixed(1);
        }
        if (profileData.height && !isNaN(parseFloat(profileData.height))) {
          const heightCm = parseFloat(profileData.height) * 2.54;
          updatedProfileData.height = heightCm.toFixed(1);
        }
      } else if (appData.units === 'Metric' && newValue === 'Imperial') {
        // Converting from Metric to Imperial: stored values are in metric, convert to imperial
        if (profileData.weight && !isNaN(parseFloat(profileData.weight))) {
          const weightLbs = parseFloat(profileData.weight) * 2.20462;
          updatedProfileData.weight = weightLbs.toFixed(1);
        }
        if (profileData.height && !isNaN(parseFloat(profileData.height))) {
          const heightInches = parseFloat(profileData.height) / 2.54;
          updatedProfileData.height = heightInches.toFixed(1);
        }
      }
      
      // Save updated profile data
      setProfileData(updatedProfileData);
      try {
        await profileStorage.saveProfileData(updatedProfileData);
      } catch (error) {
        console.error('Error saving profile data:', error);
      }
    }
    
    setAppData(updatedAppData);
    try {
      await profileStorage.saveAppData(updatedAppData);
    } catch (error) {
      console.error('Error saving app data:', error);
    }
  };

  const handleOtherAppSettings = async (type: string, value?: string) => {
    if (value) {
      const updatedAppData = {
        ...appData,
        [type]: value
      };
      setAppData(updatedAppData);
      try {
        await profileStorage.saveAppData(updatedAppData);
      } catch (error) {
        console.error('Error saving app data:', error);
      }
      setAppSettingsModalVisible(false);
      setSelectedAppSetting(null);
    } else {
      // Handle non-modal app settings
      switch (type) {
        case 'export':
          handleExportData();
          break;
        case 'import':
          handleImportData();
          break;
        case 'disclaimer':
          setDisclaimerModalVisible(true);
          break;
        case 'bug':
          setBugReportModalVisible(true);
          break;
        case 'about':
          setAboutModalVisible(true);
          break;
      }
    }
  };

  // TDEE Calculation Functions
  const calculateBMR = () => {
    let weight = parseFloat(profileData.weight);
    let height = parseFloat(profileData.height);
    const age = parseFloat(profileData.age);
    const isMale = profileData.gender === 'Male';

    if (isNaN(weight) || isNaN(height) || isNaN(age)) return 0;

    // Convert to metric units for calculations if currently in Imperial
    if (appData.units === 'Imperial') {
      weight = weight / 2.20462; // lbs to kg
      height = height * 2.54; // inches to cm
    }

    switch (appData.tdee) {
      case 'Mifflin-St Jeor':
        return isMale 
          ? (10 * weight) + (6.25 * height) - (5 * age) + 5
          : (10 * weight) + (6.25 * height) - (5 * age) - 161;
      
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
    const proteinCalories = dailyCalories * 0.30;
    const carbsCalories = dailyCalories * 0.40;
    const fatCalories = dailyCalories * 0.30;
    
    const proteinGrams = Math.round(proteinCalories / 4); // 4 calories per gram of protein
    const carbsGrams = Math.round(carbsCalories / 4);     // 4 calories per gram of carbs
    const fatGrams = Math.round(fatCalories / 9);         // 9 calories per gram of fat
    
    // Convert to ounces if Imperial units are selected
    if (appData.units === 'Imperial') {
      return {
        protein: Math.round((proteinGrams / 28.3495) * 10) / 10, // Convert to oz with 1 decimal
        carbs: Math.round((carbsGrams / 28.3495) * 10) / 10,     // Convert to oz with 1 decimal
        fat: Math.round((fatGrams / 28.3495) * 10) / 10          // Convert to oz with 1 decimal
      };
    }
    
    return {
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams
    };
  };

  // Export data function
  const handleExportData = async () => {
    try {
      triggerHapticFeedback.light();
      
      // Collect all data
      const exportData = {
        profileData: await profileStorage.getProfileData(),
        appData: await profileStorage.getAppData(),
        dailyMeals: await dailyMealStorage.getAllMeals(),
        customFoods: await customFoodStorage.getAllCustomFoods(),
        mealPresets: await mealPresetStorage.getAllMealPresets(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      // Create JSON string
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Create file path
      const fileName = `iCalories_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // Write file
      await FileSystem.writeAsStringAsync(fileUri, jsonData);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export iCalories Data'
        });
      } else {
        Alert.alert('Export Complete', `Data exported to: ${fileName}`);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    }
  };

  // Import data function
  const handleBugReport = () => {
    const email = '8Calories@gmail.com';
    const subject = 'Bug Report - 8Calories App';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.openURL(mailtoUrl).catch(err => {
      Alert.alert('Error', 'Could not open email app. Please send an email manually to 8Calories@gmail.com');
    });
    
    setBugReportModalVisible(false);
  };

  const handleImportData = async () => {
    try {
      triggerHapticFeedback.light();
      
      // Pick document
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return;
      }
      
      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const importData = JSON.parse(fileContent);
      
      // Validate data structure
      if (!importData.profileData || !importData.appData) {
        Alert.alert('Invalid File', 'The selected file does not contain valid iCalories data.');
        return;
      }
      
      // Show confirmation dialog
      Alert.alert(
        'Import Data',
        'This will replace all your current data. Are you sure you want to continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                // Import all data
                if (importData.profileData) {
                  await profileStorage.saveProfileData(importData.profileData);
                  setProfileData(importData.profileData);
                }
                
                if (importData.appData) {
                  await profileStorage.saveAppData(importData.appData);
                  setAppData(importData.appData);
                }
                
                if (importData.dailyMeals) {
                  // Clear existing daily meals and import new ones
                  for (const meal of importData.dailyMeals) {
                    await dailyMealStorage.saveMeal(meal.date, meal.meals);
                  }
                }
                
                if (importData.customFoods) {
                  // Import custom foods
                  for (const food of importData.customFoods) {
                    await customFoodStorage.saveCustomFood(food);
                  }
                }
                
                if (importData.mealPresets) {
                  // Import meal presets
                  for (const preset of importData.mealPresets) {
                    await mealPresetStorage.saveMealPreset(preset);
                  }
                }
                
                Alert.alert('Import Complete', 'Your data has been successfully imported.');
                
              } catch (importError) {
                console.error('Import error:', importError);
                Alert.alert('Import Failed', 'There was an error importing your data. Please try again.');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'There was an error reading the file. Please make sure it\'s a valid iCalories backup file.');
    }
  };

  // Testing functions
  const handleClearSetupStatus = async () => {
    try {
      triggerHapticFeedback.light();
      
      Alert.alert(
        'Clear Setup Status',
        'This will force the app to show the setup page on next launch. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              try {
                await profileStorage.clearSetupStatus();
                Alert.alert('Success', 'Setup status cleared. The app will show the setup page on next launch.');
              } catch (error) {
                console.error('Error clearing setup status:', error);
                Alert.alert('Error', 'Failed to clear setup status. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClearAllData = async () => {
    try {
      triggerHapticFeedback.light();
      
      Alert.alert(
        'Clear All Data',
        'This will permanently delete ALL app data including profile, meals, custom foods, and presets. This action cannot be undone. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete All',
            style: 'destructive',
            onPress: async () => {
              try {
                await profileStorage.clearAllData();
                Alert.alert('Success', 'All data cleared. The app will reset to initial state.');
                // Reset local state
                setProfileData({
                  activity: 'Moderately Active',
                  goal: 'Lose Weight',
                  weight: '70',
                  height: '175',
                  age: '28',
                  gender: 'Male',
                });
                setAppData({
                  units: 'Metric',
                  tdee: 'Mifflin-St Jeor',
                });
              } catch (error) {
                console.error('Error clearing all data:', error);
                Alert.alert('Error', 'Failed to clear all data. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Daily Targets */}
        <View style={styles.targetsContainer}>
          <Text style={styles.sectionTitle}>Daily Targets</Text>
          <View style={styles.targetsCard}>
            <View style={styles.caloriesSection}>
              <Text style={styles.caloriesLabel}>Daily Calories</Text>
              <Text style={styles.caloriesValue}>{calculateDailyCalories()}</Text>
              <Text style={styles.caloriesSubtext}>Based on {appData.tdee}</Text>
            </View>
            
            <View style={styles.macrosSection}>
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: '#3b82f620' }]}>
                  <Beef size={20} color="#ffffff" />
                </View>
                <View style={styles.macroInfo}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{calculateMacros().protein}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                </View>
              </View>
              
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: '#f59e0b20' }]}>
                  <Wheat size={20} color="#ffffff" />
                </View>
                <View style={styles.macroInfo}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{calculateMacros().carbs}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                </View>
              </View>
              
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: '#8b5cf620' }]}>
                  <Droplet size={20} color="#ffffff" />
                </View>
                <View style={styles.macroInfo}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <Text style={styles.macroValue}>{calculateMacros().fat}{appData.units === 'Imperial' ? 'oz' : 'g'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Settings */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Profile Settings</Text>
          {profileSettings.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={() => handleProfileSettingPress(item)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <Text style={styles.menuItemValue}>{item.value}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Settings */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          {appSettings.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={() => handleAppSettingPress(item)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  {(item.type === 'units' || item.type === 'tdee') && (
                    <Text style={styles.menuItemValue}>{item.value}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Development/Testing Section */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Development & Testing</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleClearSetupStatus}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#f59e0b20' }]}>
                <Bug size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Clear Setup Status</Text>
                <Text style={styles.menuItemSubtext}>Force app to show setup page</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleClearAllData}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#ef444420' }]}>
                <FileText size={20} color="#ef4444" />
              </View>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemText}>Clear All Data</Text>
                <Text style={styles.menuItemSubtext}>Reset app to initial state</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => {
          triggerHapticFeedback.light();
          setEditModalVisible(false);
        }}
        setting={selectedSetting}
        onSave={handleSaveProfileSetting}
        units={appData.units}
      />
      
      <EditAppSettingsModal
        visible={appSettingsModalVisible}
        onClose={() => {
          triggerHapticFeedback.light();
          setAppSettingsModalVisible(false);
        }}
        setting={selectedAppSetting}
        onSave={handleSaveAppSetting}
      />
      
      {/* Disclaimer Modal */}
      <Modal
        visible={disclaimerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          triggerHapticFeedback.light();
          setDisclaimerModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.disclaimerModal}>
            <View style={styles.disclaimerHeader}>
              <Text style={styles.disclaimerTitle}>Disclaimer</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback.light();
                  setDisclaimerModalVisible(false);
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.disclaimerContent}>
              <Text style={styles.disclaimerText}>
                8Calories is not a medical or healthcare application.{"\n\n"}
                The information provided by 8Calories is intended for general informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.{"\n\n"}
                Always consult with your physician or a qualified healthcare provider before making any changes to your diet, exercise routine, or health-related behaviors based on data from this app.{"\n\n"}
                <Text style={styles.disclaimerBold}>Use with caution.</Text>{"\n\n"}
                While we strive for accuracy, the nutritional and caloric data in 8Calories may not always be complete, accurate, or up-to-date. Users are responsible for validating all entries and calculations before relying on them for health decisions.{"\n\n"}
                8Calories is designed to assist with tracking and awareness, not to prescribe or manage medical conditions such as diabetes, eating disorders, or metabolic issues.{"\n\n"}
                By using 8Calories, you acknowledge that you do so at your own risk and that the developers and affiliates are not liable for any loss, injury, or damage arising from the use of this application.
              </Text>
            </ScrollView>
          </View>
        </View>
       </Modal>
       
       {/* Bug Report Modal */}
       <Modal
         visible={bugReportModalVisible}
         transparent={true}
         animationType="fade"
         onRequestClose={() => {
           triggerHapticFeedback.light();
           setBugReportModalVisible(false);
         }}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.bugReportModal}>
             <View style={styles.bugReportHeader}>
               <Text style={styles.bugReportTitle}>Report Bug</Text>
             </View>
             <View style={styles.bugReportContent}>
               <Text style={styles.bugReportText}>Do you want to report a bug?</Text>
             </View>
             <View style={styles.bugReportButtons}>
               <TouchableOpacity
                 style={[styles.bugReportButton, styles.cancelButton]}
                 onPress={() => {
                   triggerHapticFeedback.light();
                   setBugReportModalVisible(false);
                 }}
               >
                 <Text style={styles.cancelButtonText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[styles.bugReportButton, styles.confirmButton]}
                 onPress={() => {
                   triggerHapticFeedback.light();
                   handleBugReport();
                 }}
               >
                 <Text style={styles.confirmButtonText}>Yes</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>
       
       {/* About Modal */}
       <Modal
         visible={aboutModalVisible}
         transparent={true}
         animationType="fade"
         onRequestClose={() => {
           triggerHapticFeedback.light();
           setAboutModalVisible(false);
         }}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.aboutModal}>
             <View style={styles.aboutHeader}>
               <Text style={styles.aboutTitle}>About</Text>
               <TouchableOpacity
                 onPress={() => {
                   triggerHapticFeedback.light();
                   setAboutModalVisible(false);
                 }}
                 style={styles.closeButton}
               >
                 <Text style={styles.closeButtonText}>×</Text>
               </TouchableOpacity>
             </View>
             <View style={styles.aboutContent}>
               <Text style={styles.appName}>8Calories</Text>
               <Text style={styles.appVersion}>Version 1.0.0</Text>
               <Text style={styles.appLicense}>GPL-3.0 License</Text>
               
               <View style={styles.aboutButtons}>
                 <TouchableOpacity
                   style={styles.aboutButton}
                   onPress={() => {
                     triggerHapticFeedback.light();
                     setAboutModalVisible(false);
                     router.push('/privacy-policy');
                   }}
                 >
                   <Text style={styles.aboutButtonText}>Privacy Policy</Text>
                 </TouchableOpacity>
                 
                 <TouchableOpacity
                   style={styles.aboutButton}
                   onPress={() => {
                     triggerHapticFeedback.light();
                     setAboutModalVisible(false);
                     router.push('/licenses');
                   }}
                 >
                   <Text style={styles.aboutButtonText}>View Licenses</Text>
                 </TouchableOpacity>
               </View>
             </View>
           </View>
         </View>
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

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  menuContainer: {
    paddingHorizontal: 24,
  },
  menuItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#22c55e',
    marginTop: 2,
  },
  menuItemSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9ca3af',
    marginTop: 2,
  },
  targetsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  targetsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
  },
  caloriesSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  caloriesLabel: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 8,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  caloriesSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  macrosSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  macroInfo: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  disclaimerModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  disclaimerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  disclaimerContent: {
    padding: 20,
    maxHeight: 400,
  },
  disclaimerText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#cccccc',
  },
  disclaimerBold: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bugReportModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  bugReportHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    alignItems: 'center',
  },
  bugReportTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  bugReportContent: {
    padding: 20,
    alignItems: 'center',
  },
  bugReportText: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
  bugReportButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  bugReportButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333333',
  },
  confirmButton: {
    backgroundColor: '#22c55e',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  aboutModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  aboutContent: {
    padding: 20,
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  appLicense: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  aboutButtons: {
    width: '100%',
    gap: 12,
  },
  aboutButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  aboutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});