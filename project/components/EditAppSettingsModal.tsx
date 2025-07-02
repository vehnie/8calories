import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { X, Save } from 'lucide-react-native';
import { triggerHapticFeedback } from '@/utils/haptics';

interface AppSetting {
  label: string;
  value: string;
  type: 'units' | 'tdee';
}

interface EditAppSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  setting: AppSetting | null;
  onSave: (type: string, newValue: string) => void;
}

const unitsOptions = [
  'Metric',
  'Imperial'
];

const tdeeOptions = [
  'Mifflin-St Jeor',
  'Harris-Benedict',
  'Katch-McArdle',
  'Cunningham'
];

export function EditAppSettingsModal({ visible, onClose, setting, onSave }: EditAppSettingsModalProps) {
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (setting && visible) {
      setNewValue(setting.value);
    }
  }, [setting, visible]);

  const handleSave = () => {
    if (!setting || !newValue.trim()) return;
    
    triggerHapticFeedback.success();
    onSave(setting.type, newValue);
    onClose();
  };

  const renderOptions = () => {
    if (!setting) return null;

    const options = setting.type === 'units' ? unitsOptions : tdeeOptions;

    return (
      <View style={styles.optionsContainer}>
        {options.map((option) => (
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
            {setting.type === 'units' && (
              <Text style={[
                styles.optionSubtext,
                newValue === option && styles.selectedOptionSubtext
              ]}>
                {option === 'Metric' ? '(kg, cm, ml)' : '(lbs, ft, oz)'}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
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
            <Text style={styles.currentLabel}>Current Setting:</Text>
            <Text style={styles.currentValue}>{setting.value}</Text>
          </View>

          <View style={styles.editSection}>
            <Text style={styles.label}>Select Option</Text>
            {renderOptions()}
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
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 16,
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
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#22c55e',
  },
  optionSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedOptionSubtext: {
    color: '#22c55e',
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