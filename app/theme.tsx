import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Stack } from 'expo-router';
import { useTextSize } from '@/contexts/TextSizeContext';

export default function ThemeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, colors, setTheme } = useTheme();
  const { getFontSize } = useTextSize();

  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const hasChanges = selectedTheme !== theme;

  const handleSave = () => {
    setIsSaving(true);
    try {
      setTheme(selectedTheme);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Theme',
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.textPrimary },
          headerTintColor: colors.textPrimary,
        }}
      />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.content}>
        <TouchableOpacity
          style={[
            styles.themeOption,
            selectedTheme === 'light' && styles.selectedOption,
            {
              backgroundColor: colors.surface,
              borderColor: selectedTheme === 'light' ? colors.primary : colors.divider,
            },
          ]}
          onPress={() => setSelectedTheme('light')}
        >
          <View style={styles.optionContent}>
            <Sun size={24} color={colors.textPrimary} />
            <Text style={[styles.optionText, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>Light</Text>
          </View>
          {selectedTheme === 'light' && <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            selectedTheme === 'dark' && styles.selectedOption,
            {
              backgroundColor: colors.surface,
              borderColor: selectedTheme === 'dark' ? colors.primary : colors.divider,
            },
          ]}
          onPress={() => setSelectedTheme('dark')}
        >
          <View style={styles.optionContent}>
            <Moon size={24} color={colors.textPrimary} />
            <Text style={[styles.optionText, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>Dark</Text>
          </View>
          {selectedTheme === 'dark' && <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
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
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  selectedOption: {
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 12,
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
