import React from 'react';
import { TextInput, StyleSheet, KeyboardTypeOptions, View, Text } from 'react-native';
import { useDarkMode } from '../Contexts/DarkModeContext'; // Assuming DarkModeContext exists

interface InputElementProps {
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined;
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  value: string;
  onChangeText: (text: string) => void;
  errorMessage?: string;
  error?: boolean;
  disabled?: boolean;
}

const InputElement = (props: InputElementProps) => {
  const {
    placeholder,
    autoCapitalize = 'none',
    autoCorrect = false,
    secureTextEntry = false,
    keyboardType = 'default',
    value,
    onChangeText,
    errorMessage,
    error = false,
    disabled = false
  } = props;

  const { isDarkMode } = useDarkMode();
  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <View style={styles.container}>
      <TextInput
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          themeStyles.input,
          error && themeStyles.inputError,
          disabled && themeStyles.inputDisabled,
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? '#BBBBBB' : '#666666'}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        value={value}
        onChangeText={disabled ? undefined : onChangeText}
        editable={!disabled}
      />
      {errorMessage ? <Text style={[themeStyles.errorText]}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
});

// Light mode-specific styles
const lightStyles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDD',
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#CCC',
    color: '#999',
  },
  inputError: {
    borderColor: 'rgba(255,69,58,255)',
  },
  errorText: {
    color: 'rgba(255,69,58,255)',
  },
});

// Dark mode-specific styles
const darkStyles = StyleSheet.create({
  input: {
    backgroundColor: '#1F1F1F',
    borderColor: '#444',
    color: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#2A2A2A',
    borderColor: '#555',
    color: '#AAAAAA',
  },
  inputError: {
    borderColor: 'rgba(200,50,50,255)',
  },
  errorText: {
    color: 'rgba(200,50,50,255)',
  },
});

export default InputElement;
