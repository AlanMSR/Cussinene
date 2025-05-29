import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { X, Trash2, SquarePen } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import IngredientEditPopup from './IngredientEditPopup';

const { width, height } = Dimensions.get('window');

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface IngredientsEditPopupProps {
  visible: boolean;
  onClose: () => void;
  ingredients: Ingredient[] | { ingredient: Ingredient }[];
  onSave: (ingredients: Ingredient[]) => void;
}

const IngredientsEditPopup: React.FC<IngredientsEditPopupProps> = ({
  visible,
  onClose,
  ingredients: initialIngredients,
  onSave,
}) => {
  const [ingredients, setIngredients] = useState<{ ingredient: Ingredient }[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      const normalized = (initialIngredients as any[]).map((item) =>
        'ingredient' in item ? item : { ingredient: item }
      );
      setIngredients(normalized);
    }
  }, [visible, initialIngredients]);

  const handleDeleteIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  const handleEdit = (index: number) => {
    const ingredientToEdit = ingredients[index].ingredient;
    setSelectedIngredient({ ...ingredientToEdit });
    setEditingIndex(index);
  };

  const handleSaveEdit = (updatedIngredient: Ingredient) => {
    if (editingIndex === null) return;

    const updatedIngredients = [...ingredients];
    updatedIngredients[editingIndex] = { ingredient: updatedIngredient };
    setIngredients(updatedIngredients);
    setSelectedIngredient(null);
    setEditingIndex(null);
  };

  const handleSave = () => {
    const flattened = ingredients.map((item) => item.ingredient);
    onSave(flattened);
  };

  const renderItem = ({ item, index }: { item: { ingredient: Ingredient }; index: number }) => (
    <View style={[styles.ingredientItem, { backgroundColor: colors.surface || '#fff' }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.textPrimary || '#000' }]}>
          {item.ingredient.name}
        </Text>
        <Text style={[styles.itemQuantity, { color: colors.textSecondary || '#555' }]}>
          {item.ingredient.quantity} {item.ingredient.unit}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface || '#eee' }]}
          onPress={() => handleEdit(index)}
        >
          <SquarePen size={20} color={colors.textPrimary || '#000'} />
          {/* <Text style={[styles.actionText, { color: colors.textPrimary || '#000' }]}>Edit</Text> */}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteIngredient(index)}
        >
          <Trash2 size={20} color={colors.warning || '#ef4444'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: colors.background || '#fff' }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary || '#000' }]}>
                Ingredients
              </Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={colors.textPrimary || '#000'} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <FlatList
                data={ingredients}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.ingredient.name || String(index)}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                  <Text style={[styles.emptyText, { color: colors.textSecondary || '#666' }]}>
                    No ingredients added
                  </Text>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>

            {ingredients.length > 0 && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: '#22c55e' }]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save All</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {selectedIngredient !== null && (
        <IngredientEditPopup
          visible={true}
          onClose={() => {
            setSelectedIngredient(null);
            setEditingIndex(null);
          }}
          onSave={handleSaveEdit}
          ingredient={selectedIngredient}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30,30,30,0.95)',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: height * 0.3,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  listContent: {
    padding: 16,
    paddingBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  saveButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
});

export default React.memo(IngredientsEditPopup);
