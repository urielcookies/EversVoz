import { useState } from 'react';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { isEmpty, isEqual } from 'lodash';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../Contexts/DarkModeContext';
import TextElement from '../Components/TextElement';
import ViewElement from '../Components/ViewElement';
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';
import { supabase } from '../Utils/supabase';

interface ForgotPasswordScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
  const { isDarkMode } = useDarkMode();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

const handleResetPassword = async () => {
  setIsLoading(true);
  setError('');
  setMessage('');
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'eversvoz://reset-password'
  });
  
  setIsLoading(false);
  if (error) {
    if (isEqual(error.message, 'Email not found')) {
      setError('Correo no encontrado');
    } else {
      setError(error.message);
    }
  } else {
    setMessage('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
  }
};

  return (
    <ViewElement style={[styles.container, { backgroundColor: isDarkMode ? '#1F1F1F' : '#fff' }]}>
      <TouchableOpacity
        disabled={isLoading}
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="rgba(52,160,171,255)" />
      </TouchableOpacity>

      <TextElement bold style={styles.appName}>
        Evers
        <TextElement bold color="primary" style={styles.vozColor}>Voz</TextElement>
      </TextElement>

      <Image
        source={
          isDarkMode
            ? require('../../assets/logo-dark.png')
            : require('../../assets/logo.png')
        }
        style={styles.logo}
      />

      <InputElement
        placeholder="Correo Electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <ButtonElement
        title="Enviar enlace de recuperación"
        loading={isLoading}
        disabled={isLoading}
        onPress={handleResetPassword}
      />

      {!isEmpty(error) && <TextElement fontSize="small" color="danger" style={styles.errorText}>{error}</TextElement>}
      {!isEmpty(message) && <TextElement fontSize="small" color="success" style={styles.successText}>{message}</TextElement>}

      <TextElement style={styles.footerText}>
        ¿Ya tienes una cuenta?{' '}
        <TextElement bold color="primary" onPress={() => navigation.navigate('Login')}>
          Inicia sesión
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
    zIndex: 1,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  appName: {
    fontSize: 30,
    marginBottom: 10,
    textAlign: 'center',
  },
  vozColor: {
    fontSize: 30,
  },
  errorText: {
    marginTop: 10,
    marginLeft: 10,
  },
  successText: {
    marginTop: 10,
    marginLeft: 10,
  },
  footerText: {
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;
