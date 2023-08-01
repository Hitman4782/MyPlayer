import React from 'react';
import { StatusBar } from 'react-native';
import MainNavigator from './components/navigator';
import { ThemeProvider } from './components/ThemeContext';
import { Provider as PaperProvider } from 'react-native-paper';

export default function App() {
  return (
    <>
    <ThemeProvider>
      <PaperProvider>
        <StatusBar backgroundColor="#2D3047" barStyle="light-content" />
        <MainNavigator />
      </PaperProvider>
      </ThemeProvider>
    </>
  );
}