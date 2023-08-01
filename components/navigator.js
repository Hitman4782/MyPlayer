import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Music from '../src/Music/Music';
import AudioListScreenWithTheme from '../src/Music/MusicScreenThemed';
import RadioStreamScreen from '../src/RadioStream/RadioStream';
import StreamScreen from '../src/Stream/Stream';
import Player from '../src/Player/Player';
import MusicStreamScreen from '../src/MusicStream/MusicStream';
import FavoriteScreen from '../src/Favorites/Favorites';
import { useTheme } from './ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Tabuser = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Navigator" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Music" component={Music} options={{ headerShown: false }} />
        <Stack.Screen name="Radio Stream" component={RadioStreamScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Music Stream" component={MusicStreamScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Player" component={Player} options={{ headerShown: false }} />
        <Stack.Screen name="Favorites" component={FavoriteScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


const TabNavigator = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Music') {
            iconName = 'musical-notes';
          } else if (route.name === 'Player') {
            iconName = 'play';
          } else if (route.name === 'Stream') {
            iconName = 'radio';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f1304d',
        tabBarInactiveTintColor: theme.BottomIcon,
        tabBarStyle: {
          backgroundColor: theme.BottomNavigation,
          borderTopColor: 'gray',
         
        },
      })}
    >
      <Tab.Screen name="Stream" component={StreamScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Player" component={Player} options={{ headerShown: false }} />
      <Tab.Screen name="Music" component={AudioListScreenWithTheme} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};


export default MainNavigator;