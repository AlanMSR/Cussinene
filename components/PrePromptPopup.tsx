import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useTextSize } from '@/contexts/TextSizeContext';

interface PrePromptPopupProps {
  visible: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export default function PrePromptPopup({ 
  visible, 
  onClose,
  isLoading 
}: PrePromptPopupProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [timeAvailable, setTimeAvailable] = useState<string>('30');
  const [extraDetails, setExtraDetails] = useState<string>('');
  const { getFontSize } = useTextSize();

  const handleSubmit = () => {
    if (!selectedMealType) {
      return;
    }
    
    const data = {
      mealType: selectedMealType,
      timeAvailable: parseInt(timeAvailable) || 30,
      extraDetails: extraDetails.trim()
    };

    // Navigate to RecipeOptions with the data
    router.push({
      pathname: '/recipesOptions',
      params: { 
        data: JSON.stringify(data)
      }
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: getFontSize(20) }]}>What type of food is it?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.textPrimary, fontSize: getFontSize(20) }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mealTypeContainer}>
            {['Breakfast', 'Lunch', 'Dinner'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  { backgroundColor: selectedMealType === type ? colors.primary : colors.surface },
                  { borderColor: colors.divider },
                  { paddingVertical: getFontSize(10), paddingHorizontal: getFontSize(16) }
                ]}
                onPress={() => setSelectedMealType(type)}>
                <Text
                  style={[
                    styles.mealTypeText,
                    { color: selectedMealType === type ? colors.textWhite : colors.textPrimary, fontSize: getFontSize(16) },
                  ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>Time available (minutes)</Text>
          <TextInput
            style={[
              styles.timeInput,
              {
                backgroundColor: colors.background,
                color: colors.textPrimary,
                borderColor: colors.divider,
              },
              { paddingVertical: getFontSize(10), paddingHorizontal: getFontSize(16) }
            ]}
            value={timeAvailable}
            onChangeText={setTimeAvailable}
            keyboardType="number-pad"
            placeholder="Enter time in minutes"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>Any extra details?</Text>
          <View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  borderColor: colors.divider,
                },
              ]}
              placeholder="E.g., vegetarian, spicy, etc."
              placeholderTextColor={colors.textSecondary}
              value={extraDetails}
              onChangeText={(text) => setExtraDetails(text.slice(0, 50))}
              multiline
              maxLength={50}
            />
            <Text style={[styles.charCount, { color: colors.textSecondary, fontSize: getFontSize(12) }]}>
              {extraDetails.length}/50
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={isLoading || !selectedMealType}>
            <Text style={[styles.generateButtonText, { color: colors.textWhite, fontSize: getFontSize(16) }]}>
              {isLoading ? 'Generating...' : 'Generate'}
            </Text>
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
  },
  popup: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontWeight: 'bold',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mealTypeButton: {
    // paddingVertical: 8,
    // paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  mealTypeText: {
    fontWeight: '500',
  },
  label: {
    fontWeight: '500',
    marginBottom: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  generateButton: {
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  generateButtonText: {
    fontWeight: 'bold',
  },
  charCount: {
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 12,
  },
});