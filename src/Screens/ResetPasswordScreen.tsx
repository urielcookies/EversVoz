import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { isEmpty } from 'lodash';
import PocketBase from 'pocketbase';

import { supabase } from '../Utils/supabase';
import { useDarkMode } from '../Contexts/DarkModeContext';
import TextElement from '../Components/TextElement';
import ViewElement from '../Components/ViewElement';
import InputElement from '../Components/InputElement';
import ButtonElement from '../Components/ButtonElement';

interface ResetPasswordScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const ResetPasswordScreen = ({ navigation }: ResetPasswordScreenProps) => {
  const { isDarkMode } = useDarkMode();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');


  const handlePasswordReset = async () => {
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('La contraseña debe contener al menos una letra mayúscula.');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError('La contraseña debe contener al menos una letra minúscula.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError('La contraseña debe contener al menos un número.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setError('La contraseña debe contener al menos un carácter especial (ej: !@#$%).');
      return;
    }

    setIsLoading(true);
    
    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message); // Set general error state for Supabase errors
    } else {
      // ------------------TEMPORARY--------------------
      try {
        if (data.user?.email) {
          const pb = new PocketBase(process.env.EXPO_PUBLIC_POCKETBASE_API);
          await pb.collection('_superusers').authWithPassword(
            process.env.EXPO_PUBLIC_POCKETBASE_SUPERUSER_EMAIL as string,
            process.env.EXPO_PUBLIC_POCKETBASE_SUPERUSER_PASSWORD as string,
          );
          const user = await pb.collection('eversvoz_users').getFirstListItem(`email="${data.user.email}"`);
          await pb.collection('eversvoz_users').update(user.id, {
            password: newPassword,
            passwordConfirm: newPassword,
          });
        }
      } catch (pocketbaseError) {
        console.error('PocketBase update failed:', pocketbaseError);
      } finally {
        setIsLoading(false);
        setMessage('¡Contraseña actualizada con éxito! Por favor, inicia sesión.');
        Alert.alert('Éxito', '¡Contraseña actualizada con éxito! Por favor, inicia sesión.');
        navigation.navigate('Login');
      }
      // ------------------------------------------------
    }
  };

  // When user types, clear general form error/message
  const handleInputChange = (setter: (text: string) => void) => (text: string) => {
    setter(text);
    if (error) setError('');
    if (message) setMessage('');
  };

  return (
    <ViewElement style={[styles.container, { backgroundColor: isDarkMode ? '#1F1F1F' : '#fff' }]}>
      {navigation.canGoBack() && (
        <TouchableOpacity
          disabled={isLoading}
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="rgba(52,160,171,255)" />
        </TouchableOpacity>
      )}

      <TextElement bold style={styles.title}>
        Establecer Nueva Contraseña
      </TextElement>

      <TextElement style={styles.subtitle}>
        Ingresa tu nueva contraseña a continuación.
      </TextElement>

      <InputElement
        placeholder="Nueva Contraseña"
        secureTextEntry
        value={newPassword}
        onChangeText={handleInputChange(setNewPassword)}
        error={!isEmpty(error)} // Highlight field if there's any form error
        // errorMessage={error} // InputElement will display its own errorMessage prop if provided
                              // For general form errors, we use the TextElement below.
                              // If you want input-specific errors, you'd need more granular error states.
      />

      <InputElement
        placeholder="Confirmar Nueva Contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={handleInputChange(setConfirmPassword)}
        error={!isEmpty(error)} // Highlight field if there's any form error
      />

      <ButtonElement
        title={isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
        loading={isLoading}
        disabled={isLoading || !newPassword || !confirmPassword}
        onPress={handlePasswordReset}
        style={styles.button}
      />

      {/* Display general form error messages */}
      {!isEmpty(error) && (
        <TextElement fontSize="small" color="danger" style={styles.messageText}>
          {error}
        </TextElement>
      )}
      {/* Display success message */}
      {!isEmpty(message) && (
        <TextElement fontSize="small" color="success" style={styles.messageText}>
          {message}
        </TextElement>
      )}
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
  title: {
    fontSize: 26,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d', // Consider making this color dynamic with dark mode
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  button: {
    marginTop: 10,
  },
  messageText: {
    marginTop: 15,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});

export default ResetPasswordScreen;