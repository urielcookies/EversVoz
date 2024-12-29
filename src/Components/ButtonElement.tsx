import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDarkMode } from '../Contexts/DarkModeContext';

interface ButtonElementProps {
  title: string;
  color?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  onPress: () => void;
  style?: object;
  textStyle?: object;
  loading?: boolean;
  disabled?: boolean;
  width?: string;
  icon?: string;
}

const ButtonElement: React.FC<ButtonElementProps> = (props) => {
  const {
    title,
    color = 'default',
    onPress,
    style,
    textStyle,
    loading = false,
    disabled = false,
    width = '100%',
    icon,
  } = props;

  const { isDarkMode } = useDarkMode(); // Get dark mode state

  // Dynamic background color for the button
  const dynamicBackgroundColor = disabled
  ? isDarkMode
    ? '#555555'
    : '#cccccc'
  : isDarkMode
  ? darkBgColor[color]
  : lightBgColor[color];

  const dynamicOpacity = disabled ? 0.7 : 1;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { width, backgroundColor: dynamicBackgroundColor, opacity: dynamicOpacity },
        style,
      ]}
      onPress={loading || disabled ? undefined : onPress}
      activeOpacity={loading || disabled ? 1 : 0.7}>
      <View style={styles.contentContainer}>
        {loading && (
          <ActivityIndicator size="small" color={isDarkMode ? '#000' : '#fff'} style={styles.loader} />
        )}
        {!loading && icon && <Icon name={icon} size={20} color={isDarkMode ? '#000' : '#fff'} style={styles.icon} />}
        <Text style={[styles.buttonText, { color: isDarkMode ? '#000' : '#fff' }, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Light mode background colors
const lightBgColor = {
  default: 'rgba(52,160,171,255)',
  danger: 'rgba(255,69,58,255)',
  warning: 'rgba(255,193,7,255)',
  info: 'rgba(0,123,255,255)',
  success: 'rgba(40,167,69,255)',
};

// Dark mode background colors
const darkBgColor = {
  default: 'rgba(34,128,144,255)',
  danger: 'rgba(200,50,50,255)',
  warning: 'rgba(204,153,0,255)',
  info: 'rgba(0,90,204,255)',
  success: 'rgba(34,139,34,255)',
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginRight: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
});

export default ButtonElement;
