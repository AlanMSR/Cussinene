import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Clock } from 'lucide-react-native';
import { Recipe } from '@/types/recipe';
import RecipeDetailsPopup from './RecipeDetailsPopup';
import { useTextSize } from '@/contexts/TextSizeContext';

interface RecipeCardProps {
  recipe: Recipe;
  recipeId?: string;
}

export default function RecipeCard({ recipe, recipeId }: RecipeCardProps) {
  const { colors } = useTheme();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { getFontSize } = useTextSize();

  const handlePress = () => {
    setIsPopupVisible(true);
  };
  console.log("RecipeCard recipe", recipe);
  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={handlePress}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: getFontSize(18) }]}>{recipe.title}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: getFontSize(14) }]}>
              {recipe.cookingTime} mins
            </Text>
          </View>
        </View>
        <Text 
          style={[styles.ingredientsPreview, { color: colors.textSecondary, fontSize: getFontSize(14) }]}
          numberOfLines={2}>
          {recipe.ingredients
            .slice(0, 3)
            .map(i => `${i.quantity} ${i.unit} ${i.name}`)
            .join(', ')}...
        </Text>
      </TouchableOpacity>

      <RecipeDetailsPopup
        visible={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
        recipe={recipe}
        recipeId={recipeId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 4,
  },
  ingredientsPreview: {
    lineHeight: 20,
  },
});