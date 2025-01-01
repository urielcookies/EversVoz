import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../Contexts/DarkModeContext';
import { useUserSession } from '../Contexts/UserSessionContext';
import HomeScreen from '../Screens/HomeScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import SignUpScreen from '../Screens/SignUpScreen';
import SignUpContinueScreen from '../Screens/SignUpContinueScreen';
import SignUpFinalScreen from '../Screens/SignUpFinalScreen';
import LoginScreen from '../Screens/LoginScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const BottomTabs = () => {
  const { session } = useUserSession();
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
      <Tab.Screen name="Home" options={{ tabBarLabel: 'Inicio' }} component={HomeScreen} />
      <Tab.Screen name="Profile" options={{ tabBarLabel: 'Perfil' }} component={ProfileScreen} />
    </Tab.Navigator>
  )

  return (
    <NavigationContainer>
      {session ? <BottomTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default BottomTabs;
