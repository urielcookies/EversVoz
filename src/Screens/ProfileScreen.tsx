import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomButton from '../Components/CustomButton';
import CustomSwitch from '../Components/CustomSwitch';

const ProfileScreen = () => {
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
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.darkModeText}>Modo Oscuro</Text>
        <CustomSwitch />
      </View>

      <View style={styles.spacer} />

      <CustomButton
        title="Eliminar Cuenta"
        color="danger"
        onPress={handleDeleteAccount}
        width="100%"
        icon="trash-o"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
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
  darkModeText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  spacer: {
    height: 20, // Adjust the height as needed
  },
});

export default ProfileScreen;
