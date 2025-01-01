import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase, RouteProp, useRoute } from '@react-navigation/native';
import { isEmpty } from 'lodash';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../Utils/supabase';
import { useUserSession } from '../Contexts/UserSessionContext';
import { useDarkMode } from '../Contexts/DarkModeContext';
import ViewElement from '../Components/ViewElement';
import TextElement from '../Components/TextElement';
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';

interface SignUpFinalScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

interface RouteParams {
  email: string;
}

const SignUpFinalScreen = (props: SignUpFinalScreenProps) => {
  const { navigation } = props;
  const { setSession } = useUserSession();
  const { isDarkMode } = useDarkMode();
  const route = useRoute<RouteProp<{ params: RouteParams }>>();
  const { email } = route.params;

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSendOtp = async () => {
    await supabase.auth.resend({
      email,
      type: 'signup',
    });
  };

  const handleVerifyOtp = async () => {
    if (isEmpty(otp)) {
      setOtpError('OTP cannot be empty');
      return;
    }

    if (otp.length !== 6 || !/^[0-9]{6}$/.test(otp)) {
      setOtpError('Invalid OTP format. OTP must be 6 digits.');
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
  
    // if (data.user) {
    //   await supabaseAdmin.auth.admin.updateUserById(
    //     data.user.id,
    //     { phone: `+${phoneNumber.replace(/\D/g, '')}` }
    //   )
    // }

    if (error) {
      setOtpError(error.message);
      return false;
    } else {
      setSession(data.session);
    }

    // const { data, error } = await supabase.auth.verifyOtp({
    //   phone: '+521234567890',
    //   token: '123456',
    //   type: 'sms'
    // });
  };

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

      <InputElement
        placeholder="Ingresar Código"
        keyboardType="numeric"
        value={otp}
        onChangeText={(text: string) => setOtp(text)} />

      <ButtonElement title="Verificar Código" onPress={handleVerifyOtp} />
      {!isEmpty(otpError) && <TextElement color="danger" fontSize="small" style={styles.errorText}>{otpError}</TextElement>}

      <TextElement style={styles.footerText}>
        ¿No recibiste un código?{' '}
        <TextElement
          bold
          color="primary"
          onPress={handleSendOtp}>
          Reenviar Código
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
  footerText: {
    marginTop: 20,
    fontSize: 14,
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

export default SignUpFinalScreen;
