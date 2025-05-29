import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import LoadingScreen from '../components/LoadingScreen';
import { useState } from 'react';
import { useTextSize } from '@/contexts/TextSizeContext';

export default function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const {
    isLoading,
    dietaryPrefs: savedDietaryPrefs,
    allergies: savedAllergies,
    foodAllergies,
    dietaryPreferences,
    updatePreferences,
  } = usePreferences();
  const { getFontSize } = useTextSize();
  // Local state for tracking changes
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(savedDietaryPrefs);
  const [allergies, setAllergies] = useState<string[]>(savedAllergies);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when saved preferences change
  React.useEffect(() => {
    setDietaryPrefs(savedDietaryPrefs);
    setAllergies(savedAllergies);
  }, [savedDietaryPrefs, savedAllergies]);

  const toggleDietaryPreference = (name: string | null) => {
    if (!name) return;
    setDietaryPrefs(prev =>
      prev.includes(name)
        ? prev.filter(p => p !== name)
        : [...prev, name]
    );
  };

  const toggleAllergy = (name: string | null) => {
    if (!name) return;
    setAllergies(prev =>
      prev.includes(name)
        ? prev.filter(a => a !== name)
        : [...prev, name]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences(dietaryPrefs, allergies);
      router.back();
    } catch (error) {
      console.error('Error saving preferences:', error);
      // TODO: Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    dietaryPrefs.length !== savedDietaryPrefs.length ||
    allergies.length !== savedAllergies.length ||
    dietaryPrefs.some(pref => !savedDietaryPrefs.includes(pref)) ||
    allergies.some(allergy => !savedAllergies.includes(allergy));

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Preferences',
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.textPrimary },
          headerTintColor: colors.textPrimary,
        }}
      />
      {isLoading ? (
        <LoadingScreen message="Loading your preferences..." />
      ) : (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          <ScrollView style={styles.content}>
            {/* Dietary Preferences Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: getFontSize(18) }]}>Dietary Preferences</Text>
              <View style={styles.optionsGrid}>
                {dietaryPreferences.map(({ id, name }) => {
                  const isSelected = name ? dietaryPrefs.includes(name) : false;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[
                        styles.checkboxRow,
                        { backgroundColor: colors.surface, borderColor: colors.divider },
                      ]}
                      onPress={() => toggleDietaryPreference(name)}
                    >
                      <Checkbox
                        status={isSelected ? 'checked' : 'unchecked'}
                        onPress={() => toggleDietaryPreference(name)}
                        color={colors.primary}
                        uncheckedColor={colors.textPrimary}
                      />
                      <Text style={{ color: colors.textPrimary, fontSize: getFontSize(14) }}>
                        {name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Food Allergies Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: getFontSize(18) }]}>Food Allergies</Text>
              <View style={styles.optionsGrid}>
                {foodAllergies.map(({ id, name }) => {
                  const isSelected = name ? allergies.includes(name) : false;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[
                        styles.chip,
                        { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.divider },
                      ]}
                      onPress={() => toggleAllergy(name)}
                    >
                      <Text style={[
                        styles.chipText,
                        { color: isSelected ? colors.textWhite : colors.textPrimary, fontSize: getFontSize(14) },
                      ]}>
                        {name ? name.replace('_', ' ') : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: hasChanges ? colors.primary : colors.divider,
                opacity: isSaving ? 0.7 : 1,
              }
            ]}
            onPress={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <Text style={[styles.saveButtonText, { color: colors.textWhite, fontSize: getFontSize(16) }]}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    margin: 6,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontWeight: '500',
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
