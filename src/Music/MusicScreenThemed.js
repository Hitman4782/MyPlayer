import React from 'react';
import { useTheme } from '../../components/ThemeContext';
import AudioListScreen from './Music'; 

const AudioListScreenWithTheme = ({ navigation, route }) => {
  const { theme } = useTheme();

  return <AudioListScreen {...{ theme, navigation, route }} />;
};

export default AudioListScreenWithTheme;
