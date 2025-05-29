import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import PrePromptPopup from '../../components/PrePromptPopup';
import { useTextSize } from '@/contexts/TextSizeContext';
import { useUser } from '@/contexts/UserContext';
import LoadingScreen from '@/components/LoadingScreen';

export default function KitchenScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { getFontSize } = useTextSize();
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          await refreshUser();
        }
      } catch (err) {
        // Redirect to login if refresh fails (not authenticated)
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!user) {
    // Safety fallback
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          title: 'Kitchen',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={() => router.push('/settings')}
            >
              <Settings size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTitleStyle: {
            color: colors.textPrimary,
          },
        }} 
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: getFontSize(32) }]}>
          Hello, {(user.username || user.name || 'User').split(' ')[0]} {'\n'} Wanna Cook?
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => setIsPopupVisible(true)}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, { color: colors.textWhite, fontSize: getFontSize(18) }]}>
              Start cooking
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <PrePromptPopup
        visible={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
        isLoading={false}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsButton: {
    marginRight: 15,
  },
});
