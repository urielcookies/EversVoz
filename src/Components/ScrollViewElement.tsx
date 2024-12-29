import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useDarkMode } from '../Contexts/DarkModeContext';

interface ScrollViewElementProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const ScrollViewElement: React.FC<ScrollViewElementProps> = ({ children, style }) => {
  const { isDarkMode } = useDarkMode();

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <ScrollView style={[styles.container, themeStyles.container, style]}>
      {children}
    </ScrollView>
  );
};

// Base styles for shared properties
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Light mode-specific styles
const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
  },
});

// Dark mode-specific styles
const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
  },
});

export default ScrollViewElement;
