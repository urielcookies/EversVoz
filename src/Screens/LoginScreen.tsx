import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { isNull } from 'lodash';
import { createClient } from '@supabase/supabase-js'
import { useDarkMode } from '../Contexts/DarkModeContext';
import TextElement from '../Components/TextElement';
import ViewElement from '../Components/ViewElement';
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';
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
      <TextElement style={styles.appName}>
        Evers
        <TextElement style={styles.vozColor}>Voz</TextElement>
      </TextElement>

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
      {formDataError ? <TextElement fontSize="small" style={styles.errorText}>Invalid login credentials</TextElement> : null}
  
      <TextElement style={styles.footerText}>
        Don't have an account?{' '}
        <TextElement
          style={styles.linkText}
          onPress={() => navigation.navigate('SignUp')}>
          Sign Up
        </TextElement>
      </TextElement>
    </ViewElement>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  footerText: {
    marginTop: 20,
  },
  linkText: {
    color: 'rgba(52,160,171,255)', // Link color matches the button
    fontWeight: 'bold',
  },
  errorText: {
    color: 'rgba(255,69,58,255)',
    marginLeft: 10,
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  vozColor: {
    fontSize: 30,
    color: 'rgba(52,160,171,255)',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
