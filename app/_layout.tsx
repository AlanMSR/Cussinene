import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { TextSizeProvider } from '@/contexts/TextSizeContext';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { FavoriteRecipesProvider } from '@/contexts/FavoriteRecipesContext';
import { useTheme } from '@/contexts/ThemeContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <TextSizeProvider>
          <PreferencesProvider>
            <InventoryProvider>
              <FavoriteRecipesProvider>
                <StatusBarWrapper />
                <Stack>
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
                  <Stack.Screen name="preferences" options={{ headerShown: true, title: 'Preferences' }} />
                  <Stack.Screen name="theme" options={{ headerShown: true, title: 'Theme' }} />
                  <Stack.Screen name="text-size" options={{ headerShown: true, title: 'Text Size' }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </FavoriteRecipesProvider>
            </InventoryProvider>
          </PreferencesProvider>
        </TextSizeProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// Separate component to use the theme hook
function StatusBarWrapper() {
  const { theme } = useTheme();
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
}