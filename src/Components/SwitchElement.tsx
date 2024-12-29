import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useDarkMode } from '../Contexts/DarkModeContext';

type SwitchElementProps = {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
};

const SwitchElement: React.FC<SwitchElementProps> = ({ value = false, onValueChange, disabled = false, label = '' }) => {
  const { isDarkMode } = useDarkMode();
  const [switchValue, setSwitchValue] = useState<boolean>(value);
  const translateX = React.useRef(new Animated.Value(value ? 20 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: switchValue ? 20 : 0,
      duration: 300, // Smooth animation
      useNativeDriver: true,
    }).start();
  }, [switchValue]);

  const toggleSwitch = () => {
    if (disabled) return;

    const newValue = !switchValue;
    setSwitchValue(newValue);

    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const themeStyles = isDarkMode ? darkStyles : lightStyles;
  const containerColor = switchValue ? themeStyles.activeColor.backgroundColor : themeStyles.inactiveColor.backgroundColor;

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, themeStyles.label]}>{label}</Text> : null}
      <TouchableOpacity
        style={[
          styles.switchContainer,
          themeStyles.switchContainer,
          { backgroundColor: containerColor },
          disabled && styles.disabled,
        ]}
        activeOpacity={0.8}
        onPress={toggleSwitch}
        disabled={disabled}>
        <Animated.View
          style={[
            styles.switchThumb,
            themeStyles.switchThumb,
            { transform: [{ translateX }] },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginRight: 10,
    fontSize: 16,
  },
  switchContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 3,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
});

// Light mode-specific styles
const lightStyles = StyleSheet.create({
  label: {
    color: '#333',
  },
  switchContainer: {
    borderColor: '#ddd',
  },
  switchThumb: {
    backgroundColor: '#fff',
  },
  activeColor: {
    backgroundColor: 'rgba(52,160,171,255)',
  },
  inactiveColor: {
    backgroundColor: '#ccc',
  },
});

// Dark mode-specific styles
const darkStyles = StyleSheet.create({
  label: {
    color: '#FFFFFF',
  },
  switchContainer: {
    borderColor: '#555',
  },
  switchThumb: {
    backgroundColor: '#CCCCCC',
  },
  activeColor: {
    backgroundColor: 'rgba(34,128,144,255)',
  },
  inactiveColor: {
    backgroundColor: '#444',
  },
});

export default SwitchElement;
