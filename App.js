import React from 'react';
import { StatusBar } from 'react-native';
import MainNavigator from './components/navigator';
import { Provider as PaperProvider } from 'react-native-paper';

export default function App() {
  return (
    <>
      <PaperProvider>
        <StatusBar backgroundColor="#2D3047" barStyle="light-content" />
        <MainNavigator />
      </PaperProvider>
    </>
  );
}