import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';
import { isEmpty } from 'lodash';

interface SignUpFinalScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const SignUpFinalScreen = (props: SignUpFinalScreenProps) => {
  const { navigation } = props;
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
        <Text style={styles.title}>{phoneNumber}</Text>
      </View>

      <InputElement
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={(text: string) => setOtp(text)} />

      <ButtonElement title="Verify OTP" onPress={handleVerifyOtp} />
      {!isEmpty(otpError) && <Text style={styles.errorText}>{otpError}</Text>}

      <Text style={styles.footerText}>
        Didn't receive an OTP?{' '}
        <Text
          style={styles.linkText}
          onPress={handleSendOtp}>
          Resend OTP
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
  footerText: {
    marginTop: 20,
    fontSize: 14,
    color: '#555',
  },
  linkText: {
    color: 'rgba(52,160,171,255)',
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

export default SignUpFinalScreen;
