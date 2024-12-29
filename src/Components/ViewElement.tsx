import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useDarkMode } from '../Contexts/DarkModeContext';

interface ViewElementProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[]; // Optional additional styles
}

const ViewElement: React.FC<ViewElementProps> = ({ children, style }) => {
  const { isDarkMode } = useDarkMode();
  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <View style={[styles.container, themeStyles.container, style]}>
      {children}
    </View>
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

export default ViewElement;
