import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Clock, X } from 'lucide-react-native';
import { Recipe } from '@/types/recipe';
import { useRouter } from 'expo-router';
import { useTextSize } from '@/contexts/TextSizeContext';

interface RecipeDetailsPopupProps {
  visible: boolean;
  onClose: () => void;
  recipe: Recipe;
  recipeId?: string;
}

export default function RecipeDetailsPopup({
  visible,
  onClose,
  recipe,
  recipeId
}: RecipeDetailsPopupProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { getFontSize } = useTextSize();

  const handleCook = () => {
    onClose();
    router.push({
      pathname: '/cooking',
      params: { 
        recipe: JSON.stringify(recipe),
        recipeId: recipeId || undefined,
      }
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: colors.surface }]}>

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: getFontSize(20) }]}>
            {recipe.title}
          </Text>

          {/* Cooking Time */}
          <View style={styles.timeContainer}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary, fontSize: getFontSize(14) }]}>
              {recipe.cookingTime} min
            </Text>
          </View>

          {/* Ingredients */}
          <ScrollView style={styles.scrollView}>
            <View style={styles.ingredientsContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerText, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>Ingredient</Text>
                <Text style={[styles.headerText, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>Unit</Text>
              </View>
              {recipe.ingredients.map((ingredient, index) => (
                <View 
                  key={ingredient.id || index} 
                  style={[styles.ingredientRow, { borderBottomColor: colors.divider }]}
                >
                  <Text style={[styles.ingredientText, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>
                    {ingredient.name}
                  </Text>
                  <Text style={[styles.unitText, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>
                    {ingredient.quantity} {ingredient.unit}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Cook Button */}
          <TouchableOpacity
            style={[styles.cookButton, { backgroundColor: '#00E676' }]}
            onPress={handleCook}
          >
            <Text style={[styles.cookButtonText, { fontSize: getFontSize(16) }]}>Cook!</Text>
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
  popup: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    marginRight: 24, // Space for close button
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    marginLeft: 4,
  },
  scrollView: {
    marginBottom: 16,
  },
  ingredientsContainer: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  headerText: {
    fontWeight: '600',
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  ingredientText: {
    flex: 1,
  },
  unitText: {
    marginLeft: 16,
  },
  cookButton: {
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 8,
  },
  cookButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
}); 