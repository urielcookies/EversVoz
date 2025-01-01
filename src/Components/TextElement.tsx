import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { useDarkMode } from '../Contexts/DarkModeContext';
import { isUndefined } from 'lodash';

interface TextElementProps extends TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  fontSize?: 'title' | 'body' | 'small';
  onPress?: () => void;
  bold?: boolean;
  color?: 'primary' | 'danger' | 'warning' | 'info' | 'success';
}

const TextElement: React.FC<TextElementProps> = (props) => {
  const {
    children,
    style,
    fontSize = 'body',
    onPress,
    bold = false,
    color
  } = props;

  const { isDarkMode } = useDarkMode();

  const fontSizeStyles = {
    title: styles.title,
    body: styles.body,
    small: styles.small,
  };

  // Determine text color based on theme and provided color prop
  const textColor =
    isUndefined(color)
      ? isDarkMode
        ? '#CCCCCC'
        : '#333333'
      : isDarkMode
      ? darkTextColor[color]
      : lightTextColor[color];

  return (
    <Text
      style={[
        styles.base,
        fontSizeStyles[fontSize],
        bold && styles.bold,
        { color: textColor },
        style,
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

// Light mode text colors
const lightTextColor = {
  primary: 'rgba(52,160,171,255)',
  danger: 'rgba(255,69,58,255)',
  warning: 'rgba(255,193,7,255)',
  info: 'rgba(0,123,255,255)',
  success: 'rgba(40,167,69,255)',
};

// Dark mode text colors
const darkTextColor = {
  primary: 'rgba(34,128,144,255)',
  danger: 'rgba(200,50,50,255)',
  warning: 'rgba(204,153,0,255)',
  info: 'rgba(0,90,204,255)',
  success: 'rgba(34,139,34,255)',
};

export default TextElement;
