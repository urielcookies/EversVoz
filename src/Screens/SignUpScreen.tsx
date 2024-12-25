import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { isEmpty, isEqual, isNull } from 'lodash';
import { createClient } from '@supabase/supabase-js'
import InputField from '../Components/InputField';
import CustomButton from '../Components/CustomButton';
interface SignUpScreenProps {
  navigation: NavigationProp<ParamListBase>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const SignUpScreen = (props: SignUpScreenProps) => {
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

      <CustomButton title="Sign Up" onPress={handleSignUp} />
      {!isEmpty(formDataError) ? <Text style={styles.errorText}>{formDataError}</Text> : null}

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
