import React from 'react';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Replace the names of the icons with the corresponding icon names you want to use from MaterialCommunityIcons
export const PlayIcon = (props) => <MaterialCommunityIcons name="play" size={30} color="#f1304d" />;
export const PauseIcon = (props) => <MaterialCommunityIcons name="pause" size={30} color="#f1304d" />;
export const StopIcon = (props) => <MaterialCommunityIcons name="stop" size={30} color="#f1304d" />;
export const NextIcon = (props) => <MaterialCommunityIcons name="skip-next" size={30} color="#f1304d" />;
export const PreviousIcon = (props) => <MaterialCommunityIcons name="skip-previous" size={30} color="#f1304d" />;
export const MusicNoteIcon = (props) => <MaterialCommunityIcons name="music-note" {...props} />;
