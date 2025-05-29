import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, SquarePen } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { ThemedText } from './ThemedText';

const client = generateClient<Schema>();

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface IngredientEditPopupProps {
  visible: boolean;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
  ingredient: Ingredient;
}

const IngredientEditPopup: React.FC<IngredientEditPopupProps> = ({
  visible,
  onClose,
  onSave,
  ingredient: initialIngredient,
}) => {
  const [ingredient, setIngredient] = useState<Ingredient>(initialIngredient);
  const [unitTypes] = useState(() => client.enums.UnitType.values());
  const [unitDropdown, setUnitDropdown] = useState(false);
  const { colors } = useTheme();

  const handleSave = () => {
    onSave(ingredient);
    onClose();
  };

  const canSave = ingredient.name.trim() !== '' && !isNaN(ingredient.quantity) && ingredient.quantity > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={() => setUnitDropdown(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centeredView}
        >
          <Pressable style={[styles.modalView, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.headerRow}>
              <ThemedText type="title" style={[styles.title, { color: colors.textPrimary }]}>
                Edit ingredient
              </ThemedText>
              <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
                <X size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ThemedText style={styles.label}>Name</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
              value={ingredient.name}
              onChangeText={(text) => setIngredient({ ...ingredient, name: text })}
              placeholder="Enter name"
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.quantityRow}>
              <View style={styles.fieldContainer}>
                <ThemedText style={styles.label}>Quantity</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                  value={String(ingredient.quantity)}
                  onChangeText={(text) => setIngredient({ ...ingredient, quantity: Number(text) || 0 })}
                  placeholder="Enter quantity"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.fieldContainer}>
                <ThemedText style={styles.label}>Unit</ThemedText>
                <Pressable
                  style={[styles.unitButton, { backgroundColor: colors.background, borderColor: colors.divider }]}
                  onPress={() => setUnitDropdown(!unitDropdown)}
                >
                  <Text
                    style={{ color: colors.textPrimary }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {ingredient.unit}
                  </Text>
                </Pressable>
                {unitDropdown && (
                  <View
                    style={[styles.dropdownContainer, { backgroundColor: colors.surface, borderColor: colors.divider }]}
                  >
                    <ScrollView
                      style={styles.dropdownScroll}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                      contentContainerStyle={styles.dropdownContent}
                    >
                      {unitTypes.map((type) => (
                        <Pressable
                          key={type}
                          style={[styles.dropdownItem, {
                            borderBottomColor: colors.divider,
                            backgroundColor: type === ingredient.unit ? colors.background : 'transparent'
                          }]}
                          onPress={() => {
                            setIngredient({ ...ingredient, unit: type });
                            setUnitDropdown(false);
                          }}
                        >
                          <Text
                            style={{
                              color: colors.textPrimary,
                              fontWeight: type === ingredient.unit ? '600' : 'normal'
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {type}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.textPrimary,
                  opacity: canSave ? 1 : 0.6,
                },
              ]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={[styles.saveButtonText, { color: colors.textWhite }]}>Save Changes</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalView: {
    width: 280,
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    borderRadius: 16,
  },
  label: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    color: '#888',
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    zIndex: 1,
  },
  fieldContainer: {
    flex: 1,
    zIndex: 2,
  },
  unitButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    height: 40,
  },
  dropdownContainer: {
    flex: 1,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    // zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownContent: {
    flexGrow: 1,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default IngredientEditPopup; 