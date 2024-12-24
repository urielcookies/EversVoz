import React from 'react';
import { TextInput, StyleSheet, KeyboardTypeOptions, View, Text } from 'react-native';

interface InputFieldProps {
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined;
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  value: string;
  onChangeText: (text: string) => void;
  errorMessage?: string;
  error?: boolean;
}

const InputField = ({
    placeholder,
    autoCapitalize = 'none',
    autoCorrect = false,
    secureTextEntry = false,
    keyboardType = 'default',
    value,
    onChangeText,
    errorMessage,
    error = false
  }: InputFieldProps) => {
  return (
    <View style={styles.container}>
      <TextInput
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginLeft: 10,
  },
});

export default InputField;
