import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase, RouteProp, useRoute } from '@react-navigation/native';
import { isEmpty, isEqual, isNull } from 'lodash';
import { Ionicons } from '@expo/vector-icons';
// import PhoneInput from 'react-native-phone-input';
import { supabase } from '../Utils/supabase';
import { useDarkMode } from '../Contexts/DarkModeContext';
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';
import ViewElement from '../Components/ViewElement';
import TextElement from '../Components/TextElement';

interface SignUpContinueScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

interface RouteParams {
  email: string;
}

const SignUpContinueScreen = (props: SignUpContinueScreenProps) => {
  const { navigation } = props;
  const { isDarkMode } = useDarkMode();

  const route = useRoute<RouteProp<{ params: RouteParams }>>();
  const { email } = route.params;

  const [formDataError, setFormDataError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // phoneNumber: '',
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

    // if (!formData.phoneNumber || !/^\+?[1-9]\d{0,14}([ -]?\d{1,4}){1,3}$/.test(formData.phoneNumber)) {
    //   setFormDataError('Invalid phone number format');
    //   return;
    // }

    // const { data, error } = await supabase.auth.signUp({
    //   phone: `+${replace(formData.phoneNumber, /\D/g, '')}`,
    //   email,
    //   password: formData.password,
    //   options: {
    //     channel: 'sms'
    //   }
    // })

    setFormDataError('');
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: formData.password,
    });
    setIsLoading(false);
    if (!isNull(error)) {
      setFormDataError(error.message);
    } else {
      setFormDataError('Email is taken');
      navigation.navigate('SignUpFinal', {
        email,
        password: formData.password,
      });
    }
  };

  // const phoneStyles = isDarkMode
  // ? {
  //   backgroundColor: '#1F1F1F',
  //   borderColor: '#444',
  //   }
  // : {
  //   backgroundColor: '#FFFFFF',
  //   borderColor: '#DDD',
  // }

  return (
    <ViewElement style={[styles.container, {backgroundColor: isDarkMode ? '#1F1F1F' : '#fff'}]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="rgba(52,160,171,255)" />
      </TouchableOpacity>
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
        <TextElement bold style={styles.title}>{email}</TextElement>
      </View>

      {/* <PhoneInput
        style={[styles.phoneInput, phoneStyles]}
        textStyle={{ color: isDarkMode ? '#FFFFFF' : '#333' }}
        initialCountry="us"
        onChangePhoneNumber={(text: string) => formDataHandler('phoneNumber', text)}
        autoFormat={true}
      /> */}
      <InputElement
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text: string) => formDataHandler('password', text)}
      />
      <InputElement
        placeholder="Confirm Password"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(text: string) => formDataHandler('confirmPassword', text)}
      />

      <ButtonElement title="Send OTP" loading={isLoading} disabled={isLoading} onPress={handleSignUpContinue} />
      {!isEmpty(formDataError)
        ? <TextElement color="danger" fontSize="small" style={styles.errorText}>{formDataError}</TextElement>
        : null}

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    borderRadius: 10,
    paddingHorizontal: 15,
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
  title: {
    fontSize: 18,
  },
});

export default SignUpContinueScreen;
