import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { X, Search, Plus, Minus } from 'lucide-react-native';
import { triggerHapticFeedback } from '@/utils/haptics';

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  mealType: string;
}

interface FoodOption {
  id: string;
  name: string;
  image: string;
  caloriesPerServing: number;
  servingSize: string;
  category: string;
}

export function AddFoodModal({ visible, onClose, mealType }: AddFoodModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [servings, setServings] = useState(1);

  const foodOptions: FoodOption[] = [
    {
      id: '1',
      name: 'Banana',
      image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 105,
      servingSize: '1 medium',
      category: 'Fruits',
    },
    {
      id: '2',
      name: 'Greek Yogurt',
      image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 130,
      servingSize: '1 cup',
      category: 'Dairy',
    },
    {
      id: '3',
      name: 'Grilled Chicken Breast',
      image: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 231,
      servingSize: '100g',
      category: 'Protein',
    },
    {
      id: '4',
      name: 'Brown Rice',
      image: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 216,
      servingSize: '1 cup cooked',
      category: 'Grains',
    },
    {
      id: '5',
      name: 'Avocado',
      image: 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 234,
      servingSize: '1 medium',
      category: 'Fruits',
    },
    {
      id: '6',
      name: 'Almonds',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 164,
      servingSize: '1 oz (28g)',
      category: 'Nuts',
    },
    {
      id: '7',
      name: 'Salmon Fillet',
      image: 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 206,
      servingSize: '100g',
      category: 'Protein',
    },
    {
      id: '8',
      name: 'Sweet Potato',
      image: 'https://images.pexels.com/photos/89247/pexels-photo-89247.jpeg?auto=compress&cs=tinysrgb&w=400',
      caloriesPerServing: 112,
      servingSize: '1 medium',
      category: 'Vegetables',
    },
  ];

  const filteredFoods = foodOptions.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    triggerHapticFeedback.light();
    onClose();
  };

  const handleAddFood = (food: FoodOption) => {
    triggerHapticFeedback.success();
    // Add food logic here
    console.log(`Adding ${servings} serving(s) of ${food.name} to ${mealType}`);
    onClose();
  };

  const adjustServings = (increment: boolean) => {
    triggerHapticFeedback.light();
    if (increment) {
      setServings(prev => prev + 0.5);
    } else if (servings > 0.5) {
      setServings(prev => prev - 0.5);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#ffffff" />
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

        {/* Servings Control */}
        <View style={styles.servingsContainer}>
          <Text style={styles.servingsLabel}>Servings</Text>
          <View style={styles.servingsControl}>
            <TouchableOpacity
              style={styles.servingsButton}
              onPress={() => adjustServings(false)}
            >
              <Minus size={20} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.servingsText}>{servings}</Text>
            <TouchableOpacity
              style={styles.servingsButton}
              onPress={() => adjustServings(true)}
            >
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Foods List */}
        <ScrollView style={styles.foodsList} showsVerticalScrollIndicator={false}>
          {filteredFoods.map((food) => {
            const totalCalories = Math.round(food.caloriesPerServing * servings);
            return (
              <TouchableOpacity
                key={food.id}
                style={styles.foodItem}
                onPress={() => handleAddFood(food)}
              >
                <Image source={{ uri: food.image }} style={styles.foodImage} />
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodCategory}>{food.category}</Text>
                  <Text style={styles.servingSize}>{food.servingSize}</Text>
                </View>
                <View style={styles.foodStats}>
                  <Text style={styles.totalCalories}>{totalCalories}</Text>
                  <Text style={styles.caloriesLabel}>calories</Text>
                  <Text style={styles.perServing}>
                    {food.caloriesPerServing} per serving
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
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
  servingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  servingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
  },
  servingsButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
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
  foodsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#2a2a2a',
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
  totalCalories: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  perServing: {
    fontSize: 11,
    color: '#6b7280',
  },
});