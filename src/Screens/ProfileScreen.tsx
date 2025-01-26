import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { adapty } from 'react-native-adapty';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabaseAdmin } from '../Utils/supabase';
import ButtonElement from '../Components/ButtonElement';
import SwitchElement from '../Components/SwitchElement';
import { useDarkMode } from '../Contexts/DarkModeContext';
import CardElement from '../Components/CardElement';
import TextElement from '../Components/TextElement';
import { useUserSession } from '../Contexts/UserSessionContext';
import { isEmpty } from 'lodash';


const ProfileScreen = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { logout, deleteUserAccount } = useUserSession();
  const [ subscription, setSubscription] = useState({
    expirationDate: '',
    renews: 'No',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await adapty.getProfile();
        console.log('basic_tier-->>', profile.accessLevels?.basic_tier)

        const expirationDate = profile.accessLevels?.basic_tier?.expiresAt
          ? format(profile.accessLevels?.basic_tier.expiresAt, "d 'de' MMMM 'de' yyyy 'a las' hh:mm:ss a", { locale: es })
          : profile.accessLevels?.basic_tier?.unsubscribedAt
            ? format(profile.accessLevels?.basic_tier.unsubscribedAt, "d 'de' MMMM 'de' yyyy 'a las' hh:mm:ss a", { locale: es })
            : ''

        setSubscription({
          expirationDate,
          renews: profile.accessLevels?.basic_tier.willRenew ? 'Si' : 'No'
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
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

    {!isEmpty(subscription) && (
      <>
        <CardElement>
          <View style={styles.subscription}>
            <TextElement bold style={styles.text}>Fin De Suscripción</TextElement>
            <View style={styles.spacer} />
            <TextElement style={styles.text}>{subscription.expirationDate}</TextElement>
          </View>
        </CardElement>

        <CardElement>
          <View style={styles.subscription}>
            <TextElement bold style={styles.text}>Renueva Suscripción</TextElement>
            <View style={styles.spacer} />
            <TextElement style={styles.text}>{String(subscription.renews)}</TextElement>
          </View>
        </CardElement>
      </>
    )}
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
