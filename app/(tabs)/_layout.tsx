import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { ChefHat, Refrigerator, BookHeart } from 'lucide-react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: colors.surface,
          },
          default: {
            backgroundColor: colors.surface,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <Refrigerator size={28} color={color} />
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Kitchen',
          tabBarIcon: ({ color }) => <ChefHat size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => <BookHeart size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
