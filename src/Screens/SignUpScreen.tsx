import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { isEqual } from 'lodash';
import InputField from '../Components/InputField';
import CustomButton from '../Components/CustomButton';

interface SignUpScreenProps {
  navigation: NavigationProp<ParamListBase>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const SignUpScreen = (props: SignUpScreenProps) => {
  const { navigation, setIsAuthenticated } = props;

  const [formDataError, setFormDataError] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirmation: '',
  });

  const formDataHandler = (field: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSignUp = () => {
    if (isEqual(formData.password, formData.passwordConfirmation)) {
      setIsAuthenticated(true);
    } else {
      setFormDataError(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>
        Evers
        <Text style={styles.vozColor}>Voz</Text>
      </Text>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
      </View>

      <InputField
        placeholder="Email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text: string) => formDataHandler('email', text)} />

      <InputField
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text: string) => formDataHandler('password', text)} />

      <InputField
        placeholder="Confirm Password"
        secureTextEntry
        value={formData.passwordConfirmation}
        error={formDataError}
        onChangeText={(text: string) => formDataHandler('passwordConfirmation', text)} />

      <CustomButton title="Sign Up" onPress={handleSignUp} />
      {formDataError ? <Text style={styles.errorText}>Passwords do not match</Text> : null}

      <Text style={styles.footerText}>
        Already have an account?{' '}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate('Login')}>
          Log In
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  footerText: {
    marginTop: 20,
    fontSize: 14,
    color: '#555',
  },
  linkText: {
    color: 'rgba(52,160,171,255)', // Link color matches the button
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginLeft: 10,
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  vozColor: {
    color: 'rgba(52,160,171,255)',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
