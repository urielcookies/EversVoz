import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase, useRoute } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';
import PhoneInput from 'react-native-phone-input'; // Importing react-native-phone-input
import InputField from '../Components/InputField';
import CustomButton from '../Components/CustomButton';
import { isEmpty, isEqual } from 'lodash';

interface SignUpContinueScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const SignUpContinueScreen = (props: SignUpContinueScreenProps) => {
  const { navigation } = props;
  const route = useRoute();
  const { email } = route.params;

  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL as string,
    process.env.EXPO_PUBLIC_SUPABASE_KEY as string
  );

  const [formDataError, setFormDataError] = useState('');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const formDataHandler = (field: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSignUpContinue = async () => {
    if (!isEqual(formData.password, formData.confirmPassword)) {
      setFormDataError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setFormDataError('Password must be at least 6 characters long');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setFormDataError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setFormDataError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setFormDataError('Password must contain at least one number');
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setFormDataError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
      return;
    }

    if (!formData.phoneNumber || !/^\+?[1-9]\d{0,14}([ -]?\d{1,4}){1,3}$/.test(formData.phoneNumber)) {
      setFormDataError('Invalid phone number format');
      return;
    }

    navigation.navigate('SignUpFinal', {
      email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="rgba(52,160,171,255)" />
      </TouchableOpacity>
      <Text style={styles.appName}>
        Evers
        <Text style={styles.vozColor}>Voz</Text>
      </Text>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>{email}</Text>
      </View>

      <PhoneInput
        style={styles.phoneInput}
        initialCountry="us"
        onChangePhoneNumber={(text: string) => formDataHandler('phoneNumber', text)}
        autoFormat={true}
      />
      <InputField
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text: string) => formDataHandler('password', text)}
      />
      <InputField
        placeholder="Confirm Password"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(text: string) => formDataHandler('confirmPassword', text)}
      />

      <CustomButton title="Continue" onPress={handleSignUpContinue} />
      {!isEmpty(formDataError)
        ? <Text style={styles.errorText}>{formDataError}</Text>
        : null}

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
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
  phoneInput: {
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    height: 50,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignUpContinueScreen;
