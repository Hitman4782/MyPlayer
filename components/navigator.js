import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Music from '../src/Music';
import RadioStreamScreen from '../src/RadioStream';
import StreamScreen from '../src/Stream';
import Player from '../src/Player';
import MusicStreamScreen from '../src/MusicStream';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};


const TabNavigator = () => {
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
        tabBarInactiveTintColor: '#CCCEDE',
        tabBarStyle: {
          backgroundColor: '#44486A',
          borderTopColor: 'gray',
         
        },
      })}
    >
      <Tab.Screen name="Stream" component={StreamScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Player" component={Player} options={{ headerShown: false }} />
      <Tab.Screen name="Music" component={Music} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};


export default MainNavigator;