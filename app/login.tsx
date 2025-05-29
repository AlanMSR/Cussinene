import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { signInWithRedirect } from 'aws-amplify/auth';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import LoadingScreen from '@/components/LoadingScreen';
import { useTextSize } from '@/contexts/TextSizeContext';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, loading } = useUser();
  const { getFontSize } = useTextSize();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [user, loading]);


  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
      // await refreshUser();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Login', headerShown: false }} />
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: getFontSize(24) }]}>Welcome!</Text>

        <TouchableOpacity
          style={[
            styles.googleButton,
            { backgroundColor: "#F2F2F2", borderColor: colors.divider },
          ]}
          onPress={handleGoogleSignIn}
        >
          <View style={styles.googleContent}>
            <Image
              source={require('../assets/images/Google_G.png')}
              style={styles.googleIcon}
            />
            <Text style={[styles.googleButtonText, { color: colors.textPrimary, fontSize: getFontSize(16) }]}>
              Sign in with Google
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontWeight: 'bold',
  },

  googleButton: {
    height: 50,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontWeight: '500',
  },
});
