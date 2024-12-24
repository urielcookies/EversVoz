import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

import InputField from '../Components/InputField';
import CustomButton from '../Components/CustomButton';

interface SignUpScreenProps {
  navigation: NavigationProp<ParamListBase>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const SignUpScreen = (props: SignUpScreenProps) => {
  const { navigation, setIsAuthenticated } = props;

  const handleSignUp = () => {
    setIsAuthenticated(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Sign Up</Text>
      </View>

      <InputField placeholder="Username" />
      <InputField placeholder="Email" keyboardType="email-address" />
      <InputField placeholder="Password" secureTextEntry />
      <InputField placeholder="Confirm Password" secureTextEntry />

      <CustomButton title="Sign Up" onPress={handleSignUp} />

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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
});

export default SignUpScreen;
