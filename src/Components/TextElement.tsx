import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useDarkMode } from '../Contexts/DarkModeContext';

interface TextElementProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  fontSize?: 'title' | 'body' | 'small';
}

const TextElement: React.FC<TextElementProps> = ({ children, style, fontSize = 'body' }) => {
  const { isDarkMode } = useDarkMode();
  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  const fontSizeStyles = {
    title: styles.title,
    body: styles.body,
    small: styles.small,
  };

  return (
    <Text
      style={[
        styles.base,
        themeStyles.text,
        fontSizeStyles[fontSize], style]}>
      {children}
    </Text>
  );
};

// Base styles shared between light and dark mode
const styles = StyleSheet.create({
  base: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
  },
  body: {
    fontSize: 16,
  },
  small: {
    fontSize: 12,
  },
});

// Light mode-specific styles
const lightStyles = StyleSheet.create({
  text: {
    color: '#333',
  },
});

// Dark mode-specific styles
const darkStyles = StyleSheet.create({
  text: {
    color: '#fff',
  },
});

export default TextElement;
