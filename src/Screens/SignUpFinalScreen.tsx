import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase, useRoute } from '@react-navigation/native';
import { isEmpty } from 'lodash';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../Contexts/DarkModeContext';
import ViewElement from '../Components/ViewElement';
import TextElement from '../Components/TextElement';
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';

interface SignUpFinalScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const SignUpFinalScreen = (props: SignUpFinalScreenProps) => {
  const { navigation } = props;
  const { isDarkMode } = useDarkMode();
  const route = useRoute();
  const { email, phoneNumber, password } = route.params;

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSendOtp = () => {
    // Simulate sending OTP
    console.log('Sending OTP to:', phoneNumber);
  };

  const handleVerifyOtp = () => {
    if (isEmpty(otp)) {
      setOtpError('OTP cannot be empty');
      return;
    }

    if (otp.length !== 6 || !/^[0-9]{6}$/.test(otp)) {
      setOtpError('Invalid OTP format. OTP must be 6 digits.');
      return;
    }

    // const { data, error } = await supabase.auth.verifyOtp({
    //   phone: '+521234567890',
    //   token: '123456',
    //   type: 'sms'
    // });

    // Proceed with verification and navigation
    console.log('Verifying OTP:', otp);
    navigation.navigate('HomeScreen'); // Adjust this to your next screen
  };

  return (
    <ViewElement style={[styles.container, {backgroundColor: isDarkMode ? '#1F1F1F' : '#fff'}]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="rgba(52,160,171,255)" />
      </TouchableOpacity>
      <TextElement style={styles.appName}>
        Evers
        <TextElement style={styles.vozColor}>Voz</TextElement>
      </TextElement>
      <View style={styles.logoContainer}>
        <Image
          source={
            isDarkMode
            ? require('../../assets/logo-dark.png')
            : require('../../assets/logo.png')}
          style={styles.logo}
        />
        <TextElement bold style={styles.title}>{phoneNumber}</TextElement>
      </View>

      <InputElement
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={(text: string) => setOtp(text)} />

      <ButtonElement title="Verify OTP" onPress={handleVerifyOtp} />
      {!isEmpty(otpError) && <TextElement color="danger" fontSize="small" style={styles.errorText}>{otpError}</TextElement>}

      <TextElement style={styles.footerText}>
        Didn't receive an OTP?{' '}
        <TextElement
          bold
          color="primary"
          onPress={handleSendOtp}>
          Resend OTP
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
