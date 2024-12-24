import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import InputField from '../Components/InputField';
import CustomButton from '../Components/CustomButton';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface LoginScreenProps {
  navigation: NavigationProp<ParamListBase>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const LoginScreen = (props: LoginScreenProps) => {
  const { navigation, setIsAuthenticated } = props;

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')} // Replace with your logo path
        style={styles.logo}
      />

      <Text style={styles.title}>Log In</Text>

      <InputField placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
      <InputField placeholder="Password" secureTextEntry />

      <CustomButton title="Log In" onPress={handleLogin} />

      <Text style={styles.footerText}>
        Don't have an account?{' '}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate('SignUp')}>
          Sign Up
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
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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

export default LoginScreen;
