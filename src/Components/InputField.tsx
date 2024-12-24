import React from 'react';
import { TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';

interface InputFieldProps {
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  [key: string]: any;
}

const InputField = ({
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    ...props
  }: InputFieldProps) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
});

export default InputField;
