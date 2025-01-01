import { useState } from 'react';
import { StyleSheet, Image } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { isEmpty, isEqual } from 'lodash';
import { useDarkMode } from '../Contexts/DarkModeContext';
import TextElement from '../Components/TextElement';
import ViewElement from '../Components/ViewElement';
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';
import { useUserSession } from '../Contexts/UserSessionContext';
import { supabase } from '../Utils/supabase';

interface LoginScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const LoginScreen = (props: LoginScreenProps) => {
  const { isDarkMode } = useDarkMode();
  const { login } = useUserSession();
  const { navigation } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showResendOTP, setShowResendOTP] = useState('');
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
    setIsLoading(true);
    const { error } = await login(formData.email, formData.password)
    setIsLoading(false);
    if (error) {
      console.log(error.message)
      if (isEqual(error.message, 'Invalid login credentials')) {
        setErrorMessage('Credenciales de inicio de sesión inválidas');
      }
      else if (isEqual(error.message, 'Email not confirmed')) {
        setErrorMessage('Correo electrónico no confirmado');
        setShowResendOTP(formData.email);
      }
      else {
        setErrorMessage(error.message);
      }
    }
  };

  const handleSendOtp = async () =>{
    setIsLoading(true);
    await supabase.auth.resend({
      email: showResendOTP,
      type: 'signup',
    });
    setIsLoading(false);
    setShowResendOTP('');
    navigation.navigate('SignUpFinal', {
      email: showResendOTP,
    })
  }

  return (
    <ViewElement style={[styles.container, {backgroundColor: isDarkMode ? '#1F1F1F' : '#fff'}]}>
      <TextElement bold style={styles.appName}>
        Evers
        <TextElement bold color="primary" style={styles.vozColor}>Voz</TextElement>
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
        placeholder="Correo Electrónico"
        keyboardType="email-address"
        onChangeText={(text) => formDataHandler('email', text)} />
  
      <InputElement
        placeholder="Contraseña"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => formDataHandler('password', text)} />
  
      <ButtonElement title="Iniciar Sesión" loading={isLoading} disabled={isLoading} onPress={handleLogin} />
      {!isEmpty(errorMessage) ? <TextElement fontSize="small" color="danger" style={styles.errorText}>{errorMessage}</TextElement> : null}
  
      <TextElement style={styles.footerText}>
        ¿No tienes una cuenta?{' '}
        <TextElement
          bold
          color="primary"
          onPress={() => navigation.navigate('SignUp')}>
          Regístrate
        </TextElement>
      </TextElement>

      
      {!isEmpty(showResendOTP) && (
        <TextElement style={styles.footerText}>
          ¿No Recibiste Un Código?{' '}
          <TextElement
            bold
            color="primary"
            onPress={handleSendOtp}>
            Reenviar Código
          </TextElement>
        </TextElement>
      )}
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

export default LoginScreen;
