import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import LoadingScreen from '@/components/LoadingScreen';
import { useTheme } from '@/contexts/ThemeContext';
import { Heart } from 'lucide-react-native';
import { Recipe } from '@/types/recipe';
import { useTextSize } from '@/contexts/TextSizeContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useFavoriteRecipes } from '@/contexts/FavoriteRecipesContext';

const { height } = Dimensions.get('window');

export default function CookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { inventory, deleteInventoryItem, updateInventoryItem } = useInventory();
  const { addFavoriteRecipe, removeFavoriteRecipe } = useFavoriteRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [progress] = useState(new Animated.Value(0));
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const { getFontSize } = useTextSize();
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [hasUserToggledFavorite, setHasUserToggledFavorite] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    if (params.recipe) {
      try {
        const recipeData: Recipe = JSON.parse(params.recipe as string);

        if (!recipeData.instructions || !recipeData.ingredients) {
          throw new Error('Incomplete recipe data');
        }

        setRecipe(recipeData);
        console.log('Parsed recipe data:', recipeData);
        setCompletedSteps(new Array(recipeData.instructions.length).fill(false));
      } catch (error) {
        console.error('Invalid recipe data passed to CookingScreen:', error);
      }
    }
    if (params.recipeId) {
      setRecipeId(params.recipeId as string);
      setIsFavorite(true);
    }
  }, [params.recipe, params.recipeId]);

  useEffect(() => {
    const updateFav = async () => {
      if (!recipe || !hasUserToggledFavorite) return;

      try {
        setIsLoadingFavorite(true);

        if (isFavorite) {
          const favoriteRecipe = {
            name: recipe.title,
            mealType: recipe.mealType || undefined,
            cookTime: recipe.cookingTime || 30,
            ingredients: recipe.ingredients.map(ingredient => ({
              name: ingredient.name,
              quantity: ingredient.quantity || 0,
              unit: ingredient.unit || 'GRAMS',
            })),
            steps: recipe.instructions,
          };

          const id = await addFavoriteRecipe(favoriteRecipe);
          setRecipeId(id ?? '');
        } else {
          if (recipeId) {
            await removeFavoriteRecipe(recipeId);
            setRecipeId(null);
          }
        }
      } catch (error) {
        console.error('Error updating favorites:', error);
      } finally {
        setIsLoadingFavorite(false);
        setHasUserToggledFavorite(false);
      }
    };

    updateFav();
  }, [isFavorite]);

  const handleStepToggle = (index: number) => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[index] = !newCompletedSteps[index];
    setCompletedSteps(newCompletedSteps);

    const completedCount = newCompletedSteps.filter(Boolean).length;
    const progressValue = completedCount / completedSteps.length;

    Animated.spring(progress, {
      toValue: progressValue,
      useNativeDriver: false,
    }).start();
  };

  const allStepsCompleted = completedSteps.every(Boolean);

  const handleFinish = async () => {
    setHasFinished(true);
    if (allStepsCompleted && recipe) {
      for (const ingredient of recipe.ingredients) {
        const normalize = (str: string) => str.trim().toLowerCase();

        const inventoryItem = inventory.find(item => normalize(item.name) === normalize(ingredient.name));

        if (inventoryItem) {
          console.log('Inventory item found:', inventoryItem);
          const usedQuantity = ingredient.quantity;
          const newQuantity = inventoryItem.quantity - usedQuantity;

          if (newQuantity <= 0) {
            
            await deleteInventoryItem(inventoryItem.id);
          } else {
            
            await updateInventoryItem({
              ...inventoryItem,
              quantity: newQuantity,
            });
          }
        }
      }
      setHasFinished(false);
      setShowCompletionModal(true);
    }
  };

  const handleGoToMain = () => {
    setShowCompletionModal(false);
    router.replace('/(tabs)');
  };

  const toggleFavorite = async () => {
    setHasUserToggledFavorite(true);
    setIsFavorite(prev => !prev);
  };

  if (!recipe) return null;

  if (isLoadingFavorite) {
    return <LoadingScreen message='Saving...' />;
  }

  if (hasFinished) {
    return <LoadingScreen message='Updating inventory...' />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
        }}
      />

      {/* Completion Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCompletionModal}
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary, fontSize: getFontSize(24) }]}>
              Congrats! 🎉
            </Text>
            <Text style={[styles.modalText, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>
              You've finished your recipe
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#00E676' }]}
              onPress={handleGoToMain}
            >
              <Text style={[styles.modalButtonText, { fontSize: getFontSize(16) }]}>Go to Main Screen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.mainContent}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: getFontSize(24) }]}>
          {recipe.title}
        </Text>
        <TouchableOpacity
          style={[
            styles.heartButton,
            { marginLeft: 'auto', marginRight: 16 }
          ]}
          onPress={toggleFavorite}>
          <Heart
            size={24}
            color={isFavorite ? 'red' : 'transparent'}
            fill={isFavorite ? 'red' : 'none'}
            stroke="red"
          />
        </TouchableOpacity>
        {/* Top section with ingredients */}
        <View style={styles.topSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: getFontSize(18) }]}>Ingredients</Text>
          <ScrollView style={styles.ingredientsContainer}>
            {recipe.ingredients.map((ingredient, index) => {
              // const match = ingredient.match(/^([\d.]+)?\s*(\w+)?\s*(.+)$/);
              // const [_, quantity, unit, name] = match || [];
              const { quantity, unit, name } = ingredient;

              return (
                <View
                  key={index}
                  style={[styles.ingredientRow, { borderBottomColor: colors.divider }]}
                >
                  <Text style={[styles.ingredientText, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>
                    {name || "Recipe"}
                  </Text>

                  <Text style={[styles.unitText, { color: colors.textSecondary, fontSize: getFontSize(16) }]}>
                    {quantity && unit ? `${quantity} ${unit}` : ''}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Bottom section with steps */}
        <View style={styles.stepsSection}>
          <View style={styles.stepsTitleContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: getFontSize(18) }]}>Steps</Text>
            <View style={[styles.progressBar, { backgroundColor: colors.divider }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          <ScrollView style={styles.stepsScrollView} contentContainerStyle={styles.stepsScrollContent}>
            {recipe.instructions.map((step, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.stepItem,
                  {
                    backgroundColor: completedSteps[index] ? '#E8F5E9' : colors.surface,
                    borderColor: completedSteps[index] ? '#2E7D32' : colors.divider,
                  },
                ]}
                onPress={() => handleStepToggle(index)}
              >
                <View style={styles.stepContent}>
                  <Text style={[styles.stepNumber, { color: colors.textSecondary, fontSize: getFontSize(16) }]}>
                    {index + 1}
                  </Text>
                  <Text
                    style={[
                      styles.stepText,
                      { color: completedSteps[index] ? '#2E7D32' : colors.textPrimary, fontSize: getFontSize(16) },
                    ]}
                  >
                    {step}
                  </Text>
                </View>
                <View
                  style={[
                    styles.vignetteOverlay,
                    { backgroundColor: completedSteps[index] ? '#E8F5E9' : colors.surface },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Finish button */}
      <View style={[styles.finishButtonContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.finishButton,
            {
              backgroundColor: allStepsCompleted ? '#00E676' : colors.surface,
              borderColor: allStepsCompleted ? '#00E676' : colors.divider,
            },
          ]}
          onPress={handleFinish}
          disabled={!allStepsCompleted}
        >
          <Text
            style={[
              styles.finishButtonText,
              { color: allStepsCompleted ? '#FFFFFF' : colors.textSecondary, fontSize: getFontSize(16) },
            ]}
          >
            Finish!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
  },
  heartButton: {
    marginRight: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  topSection: {
    maxHeight: height * 0.25,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  ingredientsContainer: {
    flexGrow: 0,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  ingredientText: {
    flex: 1,
    fontWeight: '500',
  },
  unitText: {
    marginLeft: 16,
  },
  stepsSection: {
    flex: 1,
    minHeight: height * 0.6,
  },
  stepsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginLeft: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E676',
  },
  stepsScrollView: {
    flex: 1,
  },
  stepsScrollContent: {
    paddingBottom: 56,
  },
  stepItem: {
    position: 'relative',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepContent: {
    flexDirection: 'row',
    padding: 16,
    zIndex: 1,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
  },
  vignetteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    opacity: 0.15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 0,
  },
  finishButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  finishButton: {
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
  },
  finishButtonText: {
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    marginBottom: 20,
  },
  modalButton: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#00E676',
  },
  modalButtonText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 