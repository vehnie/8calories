import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { X, Edit3, Trash2 } from 'lucide-react-native';
import { triggerHapticFeedback } from '@/utils/haptics';

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

interface EditFoodModalProps {
  visible: boolean;
  onClose: () => void;
  item: FoodItem | null;
  onEdit: (id: string, newAmount: number) => void;
  onDelete: (id: string) => void;
  units?: 'Metric' | 'Imperial';
}

export function EditFoodModal({ visible, onClose, item, onEdit, onDelete, units = 'Metric' }: EditFoodModalProps) {
  const [newAmount, setNewAmount] = useState('');

  // Convert nutritional values for display based on unit system
  const convertNutritionalValue = (value: number) => {
    // Only convert if the food item uses grams as serving unit
    if (units === 'Imperial' && item?.servingUnit === 'grams') {
      // Convert grams to ounces for Imperial display
      return (value / 28.3495).toFixed(1);
    }
    return value.toString();
  };

  const getUnitLabel = () => {
    // Only show converted units if the food item uses grams as serving unit
    if (units === 'Imperial' && item?.servingUnit === 'grams') {
      return 'oz';
    }
    return 'g';
  };

  React.useEffect(() => {
    if (item && visible) {
      // Extract current amount from weight string
      const currentAmountGrams = parseFloat(item.weight.match(/\d+(\.\d+)?/)?.[0] || '1');
      
      // Only convert to appropriate units for display if servingUnit is 'grams'
      if (units === 'Imperial' && item.servingUnit === 'grams') {
        // Convert grams to ounces for Imperial display
        const currentAmountOz = (currentAmountGrams / 28.3495).toFixed(1);
        setNewAmount(currentAmountOz);
      } else {
        setNewAmount(currentAmountGrams.toString());
      }
    }
  }, [item, visible, units]);

  const handleEdit = () => {
    if (!item) return;
    
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    // Only convert amount back to grams if Imperial units are used AND servingUnit is 'grams'
    const amountInGrams = (units === 'Imperial' && item.servingUnit === 'grams') ? amount * 28.3495 : amount;

    triggerHapticFeedback.success();
    onEdit(item.id, amountInGrams);
    onClose();
  };

  const handleDelete = () => {
    if (!item) return;

    Alert.alert(
      'Remove Food',
      `Are you sure you want to remove ${item.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            triggerHapticFeedback.success();
            onDelete(item.id);
            onClose();
          },
        },
      ]
    );
  };

  if (!item) return null;

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
            <Text style={styles.title}>Edit Food Item</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.foodInfo}>
            <Text style={styles.foodIcon}>{item.icon}</Text>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodDetails}>
              {item.calories} cal | {convertNutritionalValue(item.protein)}{getUnitLabel()} protein | {convertNutritionalValue(item.carbs)}{getUnitLabel()} carbs | {convertNutritionalValue(item.fat)}{getUnitLabel()} fat
            </Text>
          </View>

          <View style={styles.editSection}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={newAmount}
              onChangeText={setNewAmount}
              placeholder="Enter amount"
              placeholderTextColor="#666666"
              keyboardType="numeric"
              selectTextOnFocus
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Edit3 size={20} color="#ffffff" />
              <Text style={styles.editButtonText}>Update Amount</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Trash2 size={20} color="#ffffff" />
              <Text style={styles.deleteButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
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
  foodInfo: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
  },
  foodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  editSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
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
  actions: {
    gap: 12,
  },
  editButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});