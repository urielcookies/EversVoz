import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { supabaseAdmin } from '../Utils/supabase';
import ButtonElement from '../Components/ButtonElement';
import SwitchElement from '../Components/SwitchElement';
import { useDarkMode } from '../Contexts/DarkModeContext';
import CardElement from '../Components/CardElement';
import TextElement from '../Components/TextElement';
import { useUserSession } from '../Contexts/UserSessionContext';
import { isNull } from 'lodash';

const ProfileScreen = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useUserSession();

  const deleteUser = async () => {
    try {
      // Delete the user from the authentication system
      if (isNull(user)) return;
      console.log(user.id)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (error) {
        console.error('Error deleting user:', error.message);
        return;
      }

      const { error: deleteError } = await supabaseAdmin
        .from('PhoneticUsage')
        .delete()
        .eq('user_id', user.id);
      if (deleteError) {
        console.error('Error deleting user data:', deleteError.message);
        return;
      }

      // Log the user out
      logout();
      console.log("Account deleted");
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "¿Estás seguro de que deseas eliminar tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: 'destructive', onPress: deleteUser }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <CardElement>
        <View style={styles.row}>
          <TextElement style={styles.text}>Modo Oscuro</TextElement>
          <SwitchElement value={isDarkMode} onValueChange={toggleDarkMode} />
        </View>

      <View style={styles.spacer} />

      <ButtonElement
          title="Finalizar La Sesión"
          onPress={logout}
          width="100%"
          icon="sign-out" />

        <ButtonElement
          title="Eliminar Cuenta"
          color="danger"
          onPress={handleDeleteAccount}
          width="100%"
          icon="trash-o" />
      </CardElement>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
});

export default ProfileScreen;
