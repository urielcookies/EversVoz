import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js'
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';
import { isNull } from 'lodash';
import ViewElement from '../Components/ViewElement';
import { useDarkMode } from '../Contexts/DarkModeContext';

interface LoginScreenProps {
  navigation: NavigationProp<ParamListBase>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const LoginScreen = (props: LoginScreenProps) => {
  const { isDarkMode } = useDarkMode();
  const { navigation, setIsAuthenticated } = props;

  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL as string,
    process.env.EXPO_PUBLIC_SUPABASE_KEY as string
  )

  const [formDataError, setFormDataError] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const formDataHandler = (field: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (isNull(data.user)) {
      setFormDataError(true);
    } else {
      setIsAuthenticated(true);
    }
  };

  return (
    <ViewElement style={[styles.container, {backgroundColor: isDarkMode ? '#1F1F1F' : '#fff'}]}>
      <Text style={styles.appName}>
        Evers
        <Text style={styles.vozColor}>Voz</Text>
      </Text>

      <Image
        source={
          isDarkMode
          ? require('../../assets/logo-dark.png')
          : require('../../assets/logo.png')}
        style={styles.logo}
      />
  
      <InputElement
        value={formData.email}
        placeholder="Email"
        keyboardType="email-address"
        onChangeText={(text) => formDataHandler('email', text)} />
  
      <InputElement
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => formDataHandler('password', text)} />
  
      <ButtonElement title="Log In" onPress={handleLogin} />
      {formDataError ? <Text style={styles.errorText}>Invalid login credentials</Text> : null}
  
      <Text style={styles.footerText}>
        Don't have an account?{' '}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate('SignUp')}>
          Sign Up
        </Text>
      </Text>
    </ViewElement>
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

export default LoginScreen;
