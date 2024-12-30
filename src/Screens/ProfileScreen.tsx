import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import ButtonElement from '../Components/ButtonElement';
import SwitchElement from '../Components/SwitchElement';
import { useDarkMode } from '../Contexts/DarkModeContext';
import CardElement from '../Components/CardElement';
import TextElement from '../Components/TextElement';

const ProfileScreen = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "¿Estás seguro de que deseas eliminar tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => console.log("Account deleted") }
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
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#f5f5f5',
    // padding: 16,
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
    height: 20, // Adjust the height as needed
  },
});

export default ProfileScreen;
