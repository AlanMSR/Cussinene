import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import { useState, useEffect } from 'react';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Settings, Palette, Type } from 'lucide-react-native';
import { signOut } from 'aws-amplify/auth';
// import { Hub } from 'aws-amplify/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useTextSize } from '@/contexts/TextSizeContext';
import { useUser } from '@/contexts/UserContext';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const { getFontSize } = useTextSize();
  const { user, refreshUser, loading, error } = useUser();
  console.log('User:', user);

  const handleLogout = async () => {
    try {
      await signOut({ global: true });
      await refreshUser();
      router.replace('/login');

    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Logout Failed',
        'Could not log out. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { 
            color: colors.textPrimary,
            fontSize: 20
          },
          headerTintColor: colors.textPrimary,
        }}
      />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {/* Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
        {/* <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
          <User size={24} color={colors.textWhite} />
        </View> */}
        <View style={styles.profileInfo}>
          <Text style={[
            styles.profileName, 
            { 
              color: colors.textPrimary,
              fontSize: getFontSize(18)
            }
          ]}>
            Hello, {user?.username || user?.name || 'User'}
          </Text>
        </View>
      </View>

      {/* Settings Options */}
      <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.optionItem, { borderBottomColor: colors.divider }]}
          onPress={() => router.push('./preferences')}
        >
          <View style={styles.optionLeft}>
            <Settings size={22} color={colors.textPrimary} />
            <Text style={[
              styles.optionText, 
              { 
                color: colors.textPrimary,
                fontSize: getFontSize(16)
              }
            ]}>
              Preferences
            </Text>
          </View>
          <ChevronRight size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionItem, { borderBottomColor: colors.divider }]}
          onPress={() => router.push('./theme')}
        >
          <View style={styles.optionLeft}>
            <Palette size={22} color={colors.textPrimary} />
            <Text style={[
              styles.optionText, 
              { 
                color: colors.textPrimary,
                fontSize: getFontSize(16)
              }
            ]}>
              Theme
            </Text>
          </View>
          <ChevronRight size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => router.push('./text-size')}
        >
          <View style={styles.optionLeft}>
            <Type size={22} color={colors.textPrimary} />
            <Text style={[
              styles.optionText, 
              { 
                color: colors.textPrimary,
                fontSize: getFontSize(16)
              }
            ]}>
              Text Size
            </Text>
          </View>
          <ChevronRight size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.warning }]}
        onPress={handleLogout}
      >
        <Text style={[
          styles.logoutText,
          {
            fontSize: getFontSize(16)
          }
        ]}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontWeight: '600',
  },
  optionsContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});
