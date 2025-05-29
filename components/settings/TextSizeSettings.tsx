import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTextSize } from '@/contexts/TextSizeContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function TextSizeSettings() {
  const insets = useSafeAreaInsets();
  const { textSize, setTextSize, getFontSize } = useTextSize();
  const { colors } = useTheme();

  const [selectedSize, setSelectedSize] = useState(textSize);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = selectedSize !== textSize;

  useEffect(() => {
    setSelectedSize(textSize);
  }, [textSize]);

  const handleSave = () => {
    setIsSaving(true);
    try {
      setTextSize(selectedSize);
    } finally {
      setIsSaving(false);
    }
  };

  const sizes: { key: 'small' | 'medium' | 'large'; label: string }[] = [
    { key: 'small', label: 'Small' },
    { key: 'medium', label: 'Medium' },
    { key: 'large', label: 'Large' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Text Size',
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.textPrimary },
          headerTintColor: colors.textPrimary,
        }}
      />
      <StatusBar style={colors.background ? 'light' : 'dark'} />

      <View style={styles.content}>
        {sizes.map((size) => {
          const isSelected = selectedSize === size.key;
          return (
            <TouchableOpacity
              key={size.key}
              style={[
                styles.sizeOption,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : colors.divider,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedSize(size.key)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: colors.textPrimary,
                    fontSize:
                      size.key === 'small' ? getFontSize(14) :
                        size.key === 'large' ? getFontSize(18) :
                          getFontSize(16),
                  },
                ]}
              >
                {size.label}
              </Text>
              {isSelected && (
                <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          {
            backgroundColor: hasChanges ? colors.primary : colors.divider,
            opacity: isSaving ? 0.7 : 1,
          },
        ]}
        onPress={handleSave}
        disabled={!hasChanges || isSaving}
      >
        <Text style={[styles.saveButtonText, { color: colors.textWhite, fontSize: getFontSize(16) }]}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sizeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  saveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: '600',
  },
});
