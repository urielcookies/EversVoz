import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { User } from '@supabase/supabase-js';
import ButtonElement from '../Components/ButtonElement';
import SwitchElement from '../Components/SwitchElement';
import { useDarkMode } from '../Contexts/DarkModeContext';
import CardElement from '../Components/CardElement';
import TextElement from '../Components/TextElement';
import { useUserSession } from '../Contexts/UserSessionContext';
import { basicTierUser, fetchResetDate } from '../Utils/adaptyFunctions';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';


interface Subscription {
  active: boolean;
  expirationDate: Date | null;
  renews: 'Si' | 'No';
};

const ProfileScreen = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, logout, deleteUserAccount } = useUserSession();
  const [resetDate, setResetDate] = useState<Date | null>(null);
  const [ subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const initialFetch = async () => {
      const resetDate =  await fetchResetDate(user as User);
      const basicUser = await basicTierUser();
      if (basicUser?.isActive) {
        setSubscription({
          active: basicUser.isActive,
          expirationDate: basicUser.expiresAt || null,
          renews: basicUser.willRenew ? 'Si' : 'No',
        })
      } else {
        setResetDate(resetDate);
      }
    }
    
    initialFetch();
  }, []);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "¿Estás seguro de que deseas eliminar tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: 'destructive', onPress: deleteUserAccount }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
      <CardElement>
        <View style={styles.subscription}>
          <TextElement bold style={styles.text}>{user?.email}</TextElement>
        </View>
      </CardElement>

      {resetDate && (
        <CardElement>
          <View style={styles.subscription}>
            <TextElement bold style={styles.text}>Créditos Restablecidos</TextElement>
            <View style={styles.spacer} />
            <TextElement style={styles.text}>
              {resetDate ? format(resetDate, "d 'de' MMMM 'de' yyyy", { locale: es }) : 'No disponible'}
            </TextElement>
          </View>
        </CardElement>
      )}

      {subscription && (
        <>
          <CardElement>
            <View style={styles.subscription}>
              <TextElement bold style={styles.text}>Fecha de renovación de la suscripción</TextElement>
              <View style={styles.spacer} />
              <TextElement style={styles.text}>
                {subscription.expirationDate ? format(subscription.expirationDate, "d 'de' MMMM 'de' yyyy", { locale: es }) : 'No disponible'}
              </TextElement>
            </View>
          </CardElement>

          <CardElement>
            <View style={styles.subscription}>
              <TextElement bold style={styles.text}>Renueva Suscripción</TextElement>
              <View style={styles.spacer} />
              <TextElement style={styles.text}>{subscription.renews}</TextElement>
            </View>
          </CardElement>
        </>
      )}

      <CardElement>
        <View style={styles.row}>
          <TextElement bold style={styles.text}>Modo Oscuro</TextElement>
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
  },
  spacer: {
    height: 20,
  },
  subscription: {
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center'
  }
});

export default ProfileScreen;
