import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../Screens/HomeScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const getTabBarIcon = (routeName: string, focused: boolean) => {
    const icons: { [key: string]: string } = {
      Home: focused ? 'home' : 'home-outline',
      Profile: focused ? 'person' : 'person-outline',
    };
    return icons[routeName as keyof typeof icons];
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={getTabBarIcon(route.name, focused) as keyof typeof Ionicons.glyphMap}
              size={size}
              color={color}
            />
          ),
          headerShown: false,
          // tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          // headerStyle: { backgroundColor: '#f4511e' },
          // headerTintColor: '#fff',
          // headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
