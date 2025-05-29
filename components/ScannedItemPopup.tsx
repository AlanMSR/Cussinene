import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from './ThemedText';
import type { Schema } from '@/amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
// import { v4 as uuidv4 } from 'uuid';
import { UnitAbbreviations as uA } from '../constants/UnitAbbreviations';
import { useTextSize } from '@/contexts/TextSizeContext';
import { useInventory } from '@/contexts/InventoryContext';

const client = generateClient<Schema>();

type ScannedItemPopupProps = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  userAttributes: any;
  scannedProduct: {
    name: string;
    quantity?: string;
    unit?: string;
  };
};

const formatUnitType = (unit: string) => {
  return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
};

const ScannedItemPopup = ({ visible, onClose, onSave, userAttributes, scannedProduct }: ScannedItemPopupProps) => {
  const { colors } = useTheme();
  const { getFontSize } = useTextSize();
  const [name, setName] = useState(scannedProduct.name);
  const [quantity, setQuantity] = useState(scannedProduct.quantity || '');
  const [unitTypes] = useState(() => client.enums.UnitType.values());
  const [unit, setUnit] = useState(() => {
    const abbreviation = scannedProduct.unit || '';
    if (!abbreviation) return unitTypes[0] || '';
    const fullUnitName = uA[abbreviation as keyof typeof uA];
    return unitTypes.find((u) => u === fullUnitName) || unitTypes[0] || '';
  });
  const [unitDropdown, setUnitDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addInventoryItem } = useInventory();
  const canSave = name.trim() !== '' && quantity.trim() !== '' && !isNaN(Number(quantity));

  const handleSave = async () => {
    if (!userAttributes.sub) return;
    setLoading(true);
    try {
      await addInventoryItem(userAttributes.sub, {
        name,
        quantity: parseFloat(quantity),
        unit,
      });
      setName('');
      setQuantity('');
      setUnit(unitTypes[0] || '');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving ingredient:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centeredView}
        >
          <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
            <View style={styles.headerRow}>
              <ThemedText type="title" style={[styles.title, { color: colors.textPrimary, fontSize: getFontSize(20) }]}>Scanned item</ThemedText>
              <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
                <Text style={[styles.closeText, { color: colors.textSecondary, fontSize: getFontSize(22) }]}>×</Text>
              </Pressable>
            </View>
            <ThemedText style={[styles.label, { fontSize: getFontSize(16) }]}>Name</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor={colors.textSecondary}
            />
            <ThemedText style={[styles.label, { fontSize: getFontSize(16) }]}>Quantity</ThemedText>
            <View style={styles.quantityRow}>
              <TextInput
                style={[styles.input, styles.quantityInput, { backgroundColor: colors.background, color: colors.textPrimary }]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Enter quantity"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <Pressable
                style={[styles.unitButton, { backgroundColor: colors.background, borderColor: colors.divider }]}
                onPress={() => setUnitDropdown(!unitDropdown)}
              >
                <Text style={{ color: colors.textPrimary, fontSize: getFontSize(16) }}>{formatUnitType(unit)} ▼</Text>
              </Pressable>
            </View>
            {unitDropdown && (
              <View style={[styles.dropdownContainer, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                <ScrollView
                  style={styles.dropdownScroll}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {unitTypes.map((u) => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => { setUnit(u); setUnitDropdown(false); }}
                      style={[
                        styles.dropdownItem,
                        unit === u && { backgroundColor: colors.background }
                      ]}
                    >
                      <Text style={{ color: colors.textPrimary, fontSize: getFontSize(16) }}>{formatUnitType(u)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.textPrimary,
                  opacity: loading || !canSave ? 0.6 : 1,
                },
              ]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={loading || !canSave}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.textSecondary, fontSize: getFontSize(16) }]}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

ScannedItemPopup.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  userAttributes: PropTypes.object.isRequired,
  scannedProduct: PropTypes.shape({
    name: PropTypes.string.isRequired,
    quantity: PropTypes.string,
    unit: PropTypes.string,
  }).isRequired,
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
  closeButton: {
    padding: 4,
    borderRadius: 16,
  },
  title: {
    fontWeight: '600',
  },
  closeText: {
    fontWeight: '600',
  },
  label: {
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
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityInput: {
    flex: 1,
    marginRight: 8,
  },
  unitButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownContainer: {
    position: 'absolute',
    right: 20,
    top: 180,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 10,
    width: 120,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: '600',
  }
});

export default ScannedItemPopup; 