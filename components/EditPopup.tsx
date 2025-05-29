import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from './ThemedText';
import { X } from 'lucide-react-native';
import { useTextSize } from '@/contexts/TextSizeContext';

interface EditPopupProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: { id: string; name: string; quantity: string; unit: string }) => void;
  item: { id: string; name: string; quantity: string; unit: string } | null;
  unitTypes: string[];
}

const formatUnitType = (unit: string) => {
  return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
};

const EditPopup: React.FC<EditPopupProps> = ({ visible, onClose, onSave, item, unitTypes }) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState(unitTypes[0] || '');
  const [unitDropdown, setUnitDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getFontSize } = useTextSize();
  const canSave = name.trim() !== '' && quantity.trim() !== '' && !isNaN(Number(quantity));

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity.toString());
      setUnit(item.unit || unitTypes[0] || '');
    }
  }, [item, unitTypes]);

  const handleSave = () => {
    if (item) {
      setLoading(true);
      onSave({ id: item.id, name, quantity, unit });
    }
    onClose();
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
              <ThemedText type="title" style={[styles.title, { color: colors.textPrimary, fontSize: getFontSize(20) }]}>Edit item</ThemedText>
              <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
                {/* <Text style={[styles.closeText, { color: colors.textSecondary }]}>×</Text> */}
                <X size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ThemedText style={[styles.label, { fontSize: getFontSize(16) }]}>Name</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, fontSize: getFontSize(16) }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor={colors.textSecondary}
            />
            <ThemedText style={[styles.label, { fontSize: getFontSize(16) }]}>Quantity</ThemedText>
            <View style={styles.quantityRow}>
              <TextInput
                style={[styles.input, styles.quantityInput, { backgroundColor: colors.background, color: colors.textPrimary, fontSize: getFontSize(16) }]}
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
    marginBottom: 2,
  },
  closeButton: {
    padding: 4,
    borderRadius: 16,
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
  },
});

export default EditPopup; 