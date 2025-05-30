import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../Contexts/DarkModeContext';
import { useUserSession } from '../Contexts/UserSessionContext';
import HomeScreen from '../Screens/HomeScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import SignUpScreen from '../Screens/SignUpScreen';
import SignUpContinueScreen from '../Screens/SignUpContinueScreen';
import SignUpFinalScreen from '../Screens/SignUpFinalScreen';
import LoginScreen from '../Screens/LoginScreen';
import ForgotPasswordScreen from '../Screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../Screens/ResetPasswordScreen';
import { Linking } from 'react-native';
import { isEqual } from 'lodash';
import { supabase } from '../Utils/supabase';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const navigationRef = createNavigationContainerRef<any>();

const BottomTabs = () => {
  const { session, emailCheck } = useUserSession();
  const getTabBarIcon = (routeName: string, focused: boolean) => {
    const icons: { [key: string]: string } = {
      Home: focused ? 'home' : 'home-outline',
      Profile: focused ? 'person' : 'person-outline',
    };
    return icons[routeName as keyof typeof icons];
  };

  const AuthStack = () => (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        options={{ headerShown: false }} >
          {props => (
            <LoginScreen {...props} />
          )}
        </Stack.Screen>

      <Stack.Screen
        name="SignUp"
        options={{ headerShown: false }}>
        {props => (
          <SignUpScreen {...props} />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="SignUpContinue"
        options={{ headerShown: false }}>
        {props => (
          <SignUpContinueScreen {...props} />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="SignUpFinal"
        options={{ headerShown: false }}>
        {props => (
          <SignUpFinalScreen {...props} />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ForgotPassword"
        options={{ headerShown: false }}>
        {props => (
          <ForgotPasswordScreen {...props} />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ResetPassword"
        options={{ headerShown: false }}>
        {props => (
          <ResetPasswordScreen {...props} />
        )}
      </Stack.Screen>

      {/* Add other authentication-related screens here */}
    </Stack.Navigator>
  );

  const BottomTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const { isDarkMode } = useDarkMode();

        return {
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={getTabBarIcon(route.name, focused) as keyof typeof Ionicons.glyphMap}
              size={size}
              color={color}
            />
          ),
          headerShown: true,
          tabBarActiveTintColor: isDarkMode ? 'rgba(34,128,144,255)' : 'rgba(52,160,171,255)',
            tabBarInactiveTintColor: isDarkMode ? '#888888' : 'gray',
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
            borderTopColor: isDarkMode ? '#444444' : '#E0E0E0',
          },
          headerStyle: {
            backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
          },
          headerTintColor: isDarkMode ? '#888888' : '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        };
      }}>
      <Tab.Screen name="Home" options={{ tabBarLabel: 'Inicio', title: 'Inicio' }} component={HomeScreen} />
      <Tab.Screen name="Profile" options={{ tabBarLabel: 'Perfil', title: 'Perfil' }} component={ProfileScreen} />
    </Tab.Navigator>
  )

  useEffect(() => {
    // const getInitialUrl = async () => {
    //   const url = await Linking.getInitialURL();
    //   console.log('[RootNavigator] Linking.getInitialURL() result:', url);
    //   // NavigationContainer + linking prop handles initial navigation based on this.
    //   // ResetPasswordScreen's own useEffect will handle token processing if it's the target.
    // };
    // getInitialUrl();

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const parsed = new URL(url);
      const fragmentParams = new URLSearchParams(parsed.hash.substring(1));
      const accessToken = fragmentParams.get('access_token');
      const refreshToken = fragmentParams.get('refresh_token');
      const type = fragmentParams.get('type');

      if (accessToken && refreshToken && isEqual(type, 'recovery')) {
        const jwt = decodeJwt(accessToken);
        if (isEqual(jwt.iss, `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1`)) {
          emailCheck(jwt.email);
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          navigate('ResetPassword');
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  
  const linking = {
    prefixes: ['eversvoz://'],
    config: {
      screens: {
        ResetPassword: 'reset-password',
      },
    },
  };

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      {session ? <BottomTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

function navigate(name: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name);
  }
}

const decodeJwt = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );
  return JSON.parse(jsonPayload);
};

export default BottomTabs;
