import React from 'react';
import { useTheme } from '../../components/ThemeContext';
import AudioListScreen from './Music'; // Adjust the import path as needed

const AudioListScreenWithTheme = ({ navigation }) => {
  const { theme } = useTheme();

  return <AudioListScreen {...{ theme, navigation }} />;
};

export default AudioListScreenWithTheme;
