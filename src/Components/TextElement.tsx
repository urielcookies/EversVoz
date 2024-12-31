import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { useDarkMode } from '../Contexts/DarkModeContext';

interface TextElementProps extends TextProps {
  children: React.ReactNode;
  style?: TextStyle;
  fontSize?: 'title' | 'body' | 'small';
  onPress?: () => void; // Add onPress prop
  bold?: boolean
}

const TextElement: React.FC<TextElementProps> = ({ children, style, fontSize = 'body', onPress, bold=false }) => {
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
        fontSizeStyles[fontSize],
        bold && styles.bold,
        style
      ]}
      onPress={onPress}
    >
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
  bold: {
    fontWeight: 'bold',
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
    color: '#CCCCCC',
  },
});

export default TextElement;
