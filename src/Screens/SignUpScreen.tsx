import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { isEmpty, isNull } from 'lodash';
import { supabase } from '../Utils/supabase';
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';
import TextElement from '../Components/TextElement';
import ViewElement from '../Components/ViewElement';
import { useDarkMode } from '../Contexts/DarkModeContext';
import { useUserSession } from '../Contexts/UserSessionContext';

interface SignUpScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const SignUpScreen = (props: SignUpScreenProps) => {
  const { navigation } = props;
  const { emailCheck } = useUserSession();
  const { isDarkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(false);
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
      setFormDataError('Por favor, ingresa una dirección de correo electrónico válida');
      return;
    }

    setIsLoading(true);
      const { data } = await emailCheck(formData.email);
      setIsLoading(false);
      if (isNull(data)) {
        setFormDataError('');
        navigation.navigate('SignUpContinue', { email: formData.email });
      } else {
        setFormDataError('El correo electrónico ya está en uso');
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
        placeholder="Correo Electrónico"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text: string) => formDataHandler('email', text)} />

      <ButtonElement title="Regístrate" loading={isLoading} disabled={isLoading} onPress={handleSignUp} />
      {!isEmpty(formDataError) ? <TextElement color="danger" fontSize="small" style={styles.errorText}>{formDataError}</TextElement> : null}

      <TextElement style={styles.footerText}>
        ¿Ya tienes una cuenta?{' '}
        <TextElement
          bold
          color="primary"
          onPress={() => navigation.navigate('Login')}>
          Iniciar Sesión
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
