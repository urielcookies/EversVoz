import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase, useRoute } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../Components/InputField';
import CustomButton from '../Components/CustomButton';

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

  const [formDataError, setFormDataError] = useState(false);
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
    if (formData.password !== formData.confirmPassword) {
      setFormDataError(true);
      console.error('Passwords do not match.');
      return;
    }

    console.log('Proceeding with sign-up continuation.');

    const { data, error } = await supabase
      .from('auth.users')
      .select('id')
      .eq('phoneNumber', formData.phoneNumber)
      .single();

    if (error) {
      console.error('Error checking phone number:', error);
    } else if (data) {
      console.log('Phone number exists:', data);
      setFormDataError(true);
    } else {
      console.log('Phone number does not exist. Proceeding to next step.');
      // Navigate to the next screen or process further
    }
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

      <InputField
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={formData.phoneNumber}
        onChangeText={(text: string) => formDataHandler('phoneNumber', text)}
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
      {formDataError ? (
        <Text style={styles.errorText}>Error: Check your inputs</Text>
      ) : null}

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
    // marginBottom: 20,
  },

});

export default SignUpContinueScreen;