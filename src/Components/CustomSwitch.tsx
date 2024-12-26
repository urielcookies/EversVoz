import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

type CustomSwitchProps = {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
};

const CustomSwitch: React.FC<CustomSwitchProps> = ({ value = false, onValueChange, disabled = false }) => {
  const [switchValue, setSwitchValue] = useState<boolean>(value);
  const translateX = React.useRef(new Animated.Value(value ? 20 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: switchValue ? 20 : 0,
      duration: 400, // Slower animation duration
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

  return (
    <TouchableOpacity
      style={[
        styles.switchContainer,
        { backgroundColor: switchValue ? 'rgba(52,160,171,255)' : '#ccc' },
        disabled && styles.disabled,
      ]}
      activeOpacity={0.8}
      onPress={toggleSwitch}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.switchThumb,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default CustomSwitch;
