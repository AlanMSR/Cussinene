import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@/contexts/ThemeContext';

const LoadingScreen = ({ message = 'Loading...' }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.message, { color: colors.textPrimary }]}>{message}</Text>
    </View>
  );
};

LoadingScreen.propTypes = {
  message: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoadingScreen;