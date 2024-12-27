import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../Screens/HomeScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import SignUpScreen from '../Screens/SignUpScreen';
import SignUpContinueScreen from '../Screens/SignUpContinueScreen';
import SignUpFinalScreen from '../Screens/SignUpFinalScreen';
import LoginScreen from '../Screens/LoginScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
            <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />
          )}
        </Stack.Screen>

      <Stack.Screen
        name="SignUp"
        options={{ headerShown: false }}>
        {props => (
          <SignUpScreen {...props} setIsAuthenticated={setIsAuthenticated} />
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
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={getTabBarIcon(route.name, focused) as keyof typeof Ionicons.glyphMap}
            size={size}
            color={color}
          />
        ),
        headerShown: true,
        tabBarActiveTintColor: 'rgba(52,160,171,255)',
        tabBarInactiveTintColor: 'gray',
        // headerStyle: { backgroundColor: '#f4511e' },
        // headerTintColor: '#fff',
        // headerTitleStyle: { fontWeight: 'bold' },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
  return (
    <NavigationContainer>
      {isAuthenticated ? <BottomTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default BottomTabs;
