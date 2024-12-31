import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { isEmpty, isNull } from 'lodash';
import { createClient } from '@supabase/supabase-js'
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';
import TextElement from '../Components/TextElement';
import ViewElement from '../Components/ViewElement';
import { useDarkMode } from '../Contexts/DarkModeContext';

interface SignUpScreenProps {
  navigation: NavigationProp<ParamListBase>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const SignUpScreen = (props: SignUpScreenProps) => {
  const { isDarkMode } = useDarkMode();
  const { navigation, setIsAuthenticated } = props;
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL as string,
    process.env.EXPO_PUBLIC_SUPABASE_KEY as string,
  )

  const [formDataError, setFormDataError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
  });

  const formDataHandler = (field: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSignUp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormDataError('Please enter a valid email address.');
      return;
    }

    const { data, error } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', formData.email)
      .single();

      if (isNull(data)) {
        setFormDataError('');
        navigation.navigate('SignUpContinue', { email: formData.email });
      } else {
        setFormDataError('Email is taken');
      }
  };

  return (
    <ViewElement style={[styles.container, {backgroundColor: isDarkMode ? '#1F1F1F' : '#fff'}]}>
      <TextElement bold style={styles.appName}>
        Evers
        <TextElement bold color="primary" style={styles.vozColor}>Voz</TextElement>
      </TextElement>
      <View style={styles.logoContainer}>
        <Image
          source={
            isDarkMode
            ? require('../../assets/logo-dark.png')
            : require('../../assets/logo.png')}
          style={styles.logo}
        />
      </View>

      <InputElement
        placeholder="Email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text: string) => formDataHandler('email', text)} />

      <ButtonElement title="Sign Up" onPress={handleSignUp} />
      {!isEmpty(formDataError) ? <TextElement color="danger" fontSize="small" style={styles.errorText}>{formDataError}</TextElement> : null}

      <TextElement style={styles.footerText}>
        Already have an account?{' '}
        <TextElement
          bold
          color="primary"
          onPress={() => navigation.navigate('Login')}>
          Log In
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
  },
  errorText: {
    marginLeft: 10,
  },
  appName: {
    fontSize: 30,
    marginBottom: 10,
    textAlign: 'center',
  },
  vozColor: {
    fontSize: 30,
  },
});

export default SignUpScreen;
