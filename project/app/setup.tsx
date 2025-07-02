import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { profileStorage } from '@/utils/storage';
import { ProfileData, AppData } from '@/utils/storage';
import { triggerHapticFeedback } from '@/utils/haptics';
import { Users, Scale, Ruler, Calendar, Activity, Target, Globe, ChevronRight, X } from 'lucide-react-native';

type SetupStep = 'landing' | 'personal-info';

interface SetupData {
  gender: string;
  weight: string;
  height: string;
  age: string;
  activity: string;
  goal: string;
  units: string;
}

const ACTIVITY_OPTIONS = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
  'Extremely Active',
];

const GOAL_OPTIONS = [
  'Lose Weight',
  'Maintain Weight',
  'Gain Weight',
];

const GENDER_OPTIONS = ['Male', 'Female'];

const UNITS_OPTIONS = ['Metric', 'Imperial'];



export default function SetupScreen() {
  const [currentStep, setCurrentStep] = useState<SetupStep>('landing');
  const [setupData, setSetupData] = useState<SetupData>({
    gender: '',
    weight: '',
    height: '',
    age: '',
    activity: '',
    goal: '',
    units: 'Metric',
  });
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const handleContinue = () => {
    triggerHapticFeedback.light();
    setCurrentStep('personal-info');
  };

  const handleFinish = async () => {
    triggerHapticFeedback.light();
    
    // Validate required fields
    if (!setupData.gender || !setupData.weight || !setupData.height || 
        !setupData.age || !setupData.activity || !setupData.goal) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      // Save profile data
      const profileData: ProfileData = {
        gender: setupData.gender,
        weight: setupData.weight,
        height: setupData.height,
        age: setupData.age,
        activity: setupData.activity,
        goal: setupData.goal,
      };

      const appData: AppData = {
        units: setupData.units,
        tdee: 'Mifflin-St Jeor', // Default TDEE equation
      };

      await profileStorage.saveProfileData(profileData);
      await profileStorage.saveAppData(appData);
      
      // Mark setup as complete (set status to 1)
      await profileStorage.setSetupStatus(1);
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving setup data:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    }
  };

  const updateSetupData = (field: keyof SetupData, value: string) => {
    setSetupData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Handle unit conversion when units change
      if (field === 'units' && prev.units !== value) {
        const isChangingToMetric = value === 'Metric';
        
        // Convert weight
        if (prev.weight && !isNaN(parseFloat(prev.weight))) {
          const weightValue = parseFloat(prev.weight);
          if (isChangingToMetric) {
            // Convert lbs to kg
            newData.weight = (weightValue / 2.20462).toFixed(1);
          } else {
            // Convert kg to lbs
            newData.weight = (weightValue * 2.20462).toFixed(1);
          }
        }
        
        // Convert height
        if (prev.height && !isNaN(parseFloat(prev.height))) {
          const heightValue = parseFloat(prev.height);
          if (isChangingToMetric) {
            // Convert inches to cm
            newData.height = (heightValue * 2.54).toFixed(1);
          } else {
            // Convert cm to inches
            newData.height = (heightValue / 2.54).toFixed(1);
          }
        }
      }
      
      return newData;
    });
  };

  const renderLandingPage = () => (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brandTitle}>8Calories</Text>
        <Text style={styles.mainHeading}>Redefine the Way You Track Calories</Text>
        <Text style={styles.description}>
          Track your calories effortlessly. No clutter. Just what you need.
        </Text>
      </View>
      
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPersonalInfoPage = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Personal Information</Text>
      
      {/* Units Selection */}
      <View style={styles.cardSection}>
        <View style={styles.cardHeader}>
          <Globe size={20} color="#22c55e" />
          <Text style={styles.cardTitle}>Units</Text>
        </View>
        <View style={styles.optionRow}>
          {UNITS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.modernOptionButton,
                setupData.units === option && styles.modernOptionButtonSelected,
              ]}
              onPress={() => {
                triggerHapticFeedback.light();
                updateSetupData('units', option);
              }}
            >
              <Text
                style={[
                  styles.modernOptionText,
                  setupData.units === option && styles.modernOptionTextSelected,
                ]}
              >
                {option}
              </Text>
              <Text style={styles.optionSubtext}>
                {option === 'Metric' ? 'kg, cm' : 'lbs, in'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Gender Selection */}
      <View style={styles.cardSection}>
        <View style={styles.cardHeader}>
          <Users size={20} color="#22c55e" />
          <Text style={styles.cardTitle}>Gender</Text>
        </View>
        <View style={styles.optionRow}>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.modernOptionButton,
                setupData.gender === option && styles.modernOptionButtonSelected,
              ]}
              onPress={() => {
                triggerHapticFeedback.light();
                updateSetupData('gender', option);
              }}
            >
              <Text
                style={[
                  styles.modernOptionText,
                  setupData.gender === option && styles.modernOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Activity Level */}
      <TouchableOpacity 
        style={styles.cardSection} 
        onPress={() => {
          triggerHapticFeedback.light();
          setShowActivityModal(true);
        }}
      >
        <View style={styles.cardHeader}>
          <Activity size={20} color="#22c55e" />
          <Text style={styles.cardTitle}>Activity Level</Text>
          <ChevronRight size={20} color="#666" style={styles.chevron} />
        </View>
        <Text style={styles.selectedValue}>
          {setupData.activity || 'Select your activity level'}
        </Text>
      </TouchableOpacity>

      {/* Weight Input */}
      <View style={styles.cardSection}>
        <View style={styles.cardHeader}>
          <Scale size={20} color="#22c55e" />
          <Text style={styles.cardTitle}>Weight</Text>
        </View>
        <TextInput
          style={styles.modernTextInput}
          value={setupData.weight}
          onChangeText={(value) => updateSetupData('weight', value)}
          placeholder={`Enter your weight (${setupData.units === 'Metric' ? 'kg' : 'lbs'})`}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
      </View>

      {/* Height Input */}
      <View style={styles.cardSection}>
        <View style={styles.cardHeader}>
          <Ruler size={20} color="#22c55e" />
          <Text style={styles.cardTitle}>Height</Text>
        </View>
        <TextInput
          style={styles.modernTextInput}
          value={setupData.height}
          onChangeText={(value) => updateSetupData('height', value)}
          placeholder={`Enter your height (${setupData.units === 'Metric' ? 'cm' : 'inches'})`}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
      </View>

      {/* Age Input */}
      <View style={styles.cardSection}>
        <View style={styles.cardHeader}>
          <Calendar size={20} color="#22c55e" />
          <Text style={styles.cardTitle}>Age</Text>
        </View>
        <TextInput
          style={styles.modernTextInput}
          value={setupData.age}
          onChangeText={(value) => updateSetupData('age', value)}
          placeholder="Enter your age"
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
      </View>

      {/* Goal */}
      <TouchableOpacity 
        style={styles.cardSection} 
        onPress={() => {
          triggerHapticFeedback.light();
          setShowGoalModal(true);
        }}
      >
        <View style={styles.cardHeader}>
          <Target size={20} color="#22c55e" />
          <Text style={styles.cardTitle}>Goal</Text>
          <ChevronRight size={20} color="#666" style={styles.chevron} />
        </View>
        <Text style={styles.selectedValue}>
          {setupData.goal || 'Select your goal'}
        </Text>
      </TouchableOpacity>


      
      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Finish Setup</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderModal = (title: string, options: string[], selectedValue: string, onSelect: (value: string) => void, onClose: () => void) => (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.modalOption,
                selectedValue === option && styles.modalOptionSelected,
              ]}
              onPress={() => {
                triggerHapticFeedback.light();
                onSelect(option);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  selectedValue === option && styles.modalOptionTextSelected,
                ]}
              >
                {option}
              </Text>
              {selectedValue === option && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {currentStep === 'landing' ? renderLandingPage() : renderPersonalInfoPage()}
      
      {/* Activity Modal */}
      {showActivityModal && renderModal(
        'Activity Level',
        ACTIVITY_OPTIONS,
        setupData.activity,
        (value) => updateSetupData('activity', value),
        () => setShowActivityModal(false)
      )}
      
      {/* Goal Modal */}
      {showGoalModal && renderModal(
        'Goal',
        GOAL_OPTIONS,
        setupData.goal,
        (value) => updateSetupData('goal', value),
        () => setShowGoalModal(false)
      )}
      

    </SafeAreaView>
   );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    margin: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  cardSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  selectedValue: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 4,
  },
  modernOptionButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
  },
  modernOptionButtonSelected: {
    backgroundColor: '#22c55e20',
    borderColor: '#22c55e',
  },
  modernOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modernOptionTextSelected: {
    color: '#22c55e',
  },
  optionSubtext: {
    color: '#9ca3af',
    fontSize: 14,
  },
  modernTextInput: {
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
  },
  listOption: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  listOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  listOptionText: {
    color: '#ccc',
    fontSize: 16,
  },
  listOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  modalOptionSelected: {
    backgroundColor: '#22c55e20',
    borderColor: '#22c55e',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: '#22c55e',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
  },
});