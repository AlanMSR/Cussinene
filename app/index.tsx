import { useEffect } from 'react';
import { Alert } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Amplify } from 'aws-amplify';
import { parseAmplifyConfig } from "aws-amplify/utils";
import outputs from '../amplify_outputs.json';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';

// Amplify.configure(outputs);

const amplifyConfig = parseAmplifyConfig(outputs);

Amplify.configure(
  {
    ...amplifyConfig,
    API: {
      ...amplifyConfig.API,
      REST: outputs.custom.API, // outputs.custom.API debe ser solo el objeto que contiene las APIs REST
    },
    Predictions: outputs.custom.Predictions, // Predictions va a este nivel
  },
  {
    API: {
      REST: {
        retryStrategy: {
          strategy: 'no-retry',
        },
      },
    },
  }
);


export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        router.replace(user ? '/(tabs)' : '/login');
      } catch (error) {
        router.replace('/login');
      }
    };

    const hubListener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          router.replace('/(tabs)');
          break;
        case 'signedOut':
          router.replace('/login');
          break;
        case 'signInWithRedirect_failure':
          Alert.alert('Error', payload.data?.error?.message || 'Login failed');
          break;
      }
    });

    checkAuth();

    return () => hubListener();
  }, [router]);

    return <Redirect href="/login" />;
}