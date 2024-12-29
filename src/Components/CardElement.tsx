import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useDarkMode } from '../Contexts/DarkModeContext';

interface CardElementProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const CardElement: React.FC<CardElementProps> = ({ children, style }) => {
  const { isDarkMode } = useDarkMode();
  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <View
      style={[styles.base, themeStyles.container, style]}>
      {children}
    </View>
  )
};

// Base styles shared between light and dark mode
const styles = StyleSheet.create({
  base: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

// Light mode-specific styles
const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
  },
});

// Dark mode-specific styles
const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1F1F1F',
    shadowColor: '#000000',
  },
});

export default CardElement;
