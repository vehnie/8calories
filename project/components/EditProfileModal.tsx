import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { X, Save } from 'lucide-react-native';
import { triggerHapticFeedback } from '@/utils/haptics';

interface ProfileSetting {
  label: string;
  value: string;
  type: 'activity' | 'goal' | 'weight' | 'height' | 'age' | 'gender';
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  setting: ProfileSetting | null;
  onSave: (type: string, newValue: string) => void;
  units?: 'Metric' | 'Imperial';
}

const activityOptions = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
  'Extremely Active'
];

const goalOptions = [
  'Lose Weight',
  'Maintain Weight',
  'Gain Weight'
];

const genderOptions = [
  'Male',
  'Female',
  'Other'
];

export function EditProfileModal({ visible, onClose, setting, onSave, units = 'Metric' }: EditProfileModalProps) {
  const [newValue, setNewValue] = useState('');

  // No conversion needed for display since values are stored in current unit system
  const convertWeightForDisplay = useCallback((weight: string) => {
    return weight;
  }, [units]);

  // No conversion needed for display since values are stored in current unit system
  const convertHeightForDisplay = useCallback((height: string) => {
    return height;
  }, [units]);

  // Convert weight from lbs to kg for storage
  const convertWeightForStorage = useCallback((weightLbs: string) => {
    if (units === 'Imperial') {
      const weightKg = parseFloat(weightLbs) / 2.20462;
      return weightKg.toFixed(1);
    }
    return weightLbs;
  }, [units]);

  // Convert height from inches to cm for storage
  const convertHeightForStorage = useCallback((heightInches: string) => {
    if (units === 'Imperial') {
      const heightCm = parseFloat(heightInches) * 2.54;
      return heightCm.toFixed(0);
    }
    return heightInches;
  }, [units]);

  useEffect(() => {
    if (setting && visible) {
      // Convert values for display based on unit system
      if (setting.type === 'weight') {
        setNewValue(convertWeightForDisplay(setting.value));
      } else if (setting.type === 'height') {
        setNewValue(convertHeightForDisplay(setting.value));
      } else {
        setNewValue(setting.value);
      }
    }
  }, [setting, visible, convertWeightForDisplay, convertHeightForDisplay]);

  const handleSave = () => {
    if (!setting) return;
    
    if (!newValue.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid value.');
      return;
    }

    // Validate numeric inputs
    if ((setting.type === 'weight' || setting.type === 'height' || setting.type === 'age') && 
        (isNaN(parseFloat(newValue)) || parseFloat(newValue) <= 0)) {
      Alert.alert('Invalid Input', 'Please enter a valid number greater than 0.');
      return;
    }

    // Store values in the current unit system (no conversion needed)
    let valueToSave = newValue.trim();

    triggerHapticFeedback.success();
    onSave(setting.type, valueToSave);
    onClose();
  };

  const renderInput = () => {
    if (!setting) return null;

    switch (setting.type) {
      case 'activity':
        return (
          <View style={styles.optionsContainer}>
            {activityOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  newValue === option && styles.selectedOption
                ]}
                onPress={() => setNewValue(option)}
              >
                <Text style={[
                  styles.optionText,
                  newValue === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'goal':
        return (
          <View style={styles.optionsContainer}>
            {goalOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  newValue === option && styles.selectedOption
                ]}
                onPress={() => setNewValue(option)}
              >
                <Text style={[
                  styles.optionText,
                  newValue === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'gender':
        return (
          <View style={styles.optionsContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  newValue === option && styles.selectedOption
                ]}
                onPress={() => setNewValue(option)}
              >
                <Text style={[
                  styles.optionText,
                  newValue === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'weight':
        return (
          <TextInput
            style={styles.input}
            value={newValue}
            onChangeText={setNewValue}
            placeholder={`Enter weight (${units === 'Imperial' ? 'lbs' : 'kg'})`}
            placeholderTextColor="#666666"
            keyboardType="numeric"
            selectTextOnFocus
          />
        );
      
      case 'height':
        return (
          <TextInput
            style={styles.input}
            value={newValue}
            onChangeText={setNewValue}
            placeholder={`Enter height (${units === 'Imperial' ? 'in' : 'cm'})`}
            placeholderTextColor="#666666"
            keyboardType="numeric"
            selectTextOnFocus
          />
        );
      
      case 'age':
        return (
          <TextInput
            style={styles.input}
            value={newValue}
            onChangeText={setNewValue}
            placeholder="Enter age (years)"
            placeholderTextColor="#666666"
            keyboardType="numeric"
            selectTextOnFocus
          />
        );
      
      default:
        return null;
    }
  };

  if (!setting) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit {setting.label}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.currentInfo}>
            <Text style={styles.currentLabel}>Current Value:</Text>
            <Text style={styles.currentValue}>
              {setting.type === 'weight' ? convertWeightForDisplay(setting.value) :
               setting.type === 'height' ? convertHeightForDisplay(setting.value) :
               setting.value}
            </Text>
          </View>

          <View style={styles.editSection}>
            <Text style={styles.label}>New Value</Text>
            {renderInput()}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#050505',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  currentInfo: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
  },
  currentLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
  },
  editSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  selectedOption: {
    backgroundColor: '#22c55e20',
    borderColor: '#22c55e',
  },
  optionText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});