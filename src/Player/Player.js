import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { firebase } from '../../components/firebase';
import { PlayIcon, PauseIcon, StopIcon, NextIcon, PreviousIcon, MusicNoteIcon, RepeatIcon, RepeatOffIcon, ShuffleIcon, ShuffleOffIcon, FavoriteBorderIcon, FavoriteIcon } from '../../components/Icon';
import { useTheme } from '../../components/ThemeContext';
import { getStyles } from './styles';

const Player = ({ route }) => {
  const { audioFile, index, audioFiles, RadioIndex, radioStations } = route.params || {};
  const { theme, toggleTheme } = useTheme();
  const styles = getStyles(theme);
  
  if (!audioFile) {
    return (
      // to display when no audio or radio is being played
      <View style={styles.container}>
        <View style={styles.musicIconContainer}>
          <MusicNoteIcon size={100} color="#f1304d" />
          <Text style={styles.audioName}>No Music or Radio is being played.</Text>
          <View style={styles.controls}>
            <IconButton icon={isRepeatEnabled ? RepeatIcon : RepeatOffIcon} onPress={() => setIsRepeatEnabled(!isRepeatEnabled)} />
            <IconButton icon={PreviousIcon} onPress={handlePrevious} />
            <IconButton icon={isPlaying ? PauseIcon : PlayIcon} onPress={handlePlayPause} />
            <IconButton icon={NextIcon} onPress={handleNext} />
            <IconButton icon={isShuffleEnabled ? ShuffleIcon : ShuffleOffIcon} onPress={() => setIsShuffleEnabled(!isShuffleEnabled)} />
          </View>
          <IconButton icon={StopIcon} onPress={handleStop} />
        </View>
      </View>
    );
  }

  
  const [isRouteRadio, setIsRouteRadio] = useState(false);
  const isSliderDisabled = duration <= 0;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [intervalObj, setIntervalObj] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(index);
  const [currentAudioFile, setCurrentAudioFile] = useState(audioFile);
  const [Radio, setIsRadio] = useState(audioFile.isRadio);
  const [RadioName, setIsRadioName] = useState(audioFile.name);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(audioFile.uri);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [currentRadioIndex, setCurrentRadioIndex] = useState(RadioIndex);
  const [isMusic, setIsMusic] = useState(!audioFile.isRadio);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Set up audio mode and other initial configurations
    const setAudioMode = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          //interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          //interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          shouldDuckAndroid: true,
          staysActiveInBackground: true,
        });
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };
    setAudioMode();

    // Subscribe to Favorites collection in Firebase
    const unsubscribeFavorites = firebase.firestore().collection('Favorites').onSnapshot(
      (snapshot) => {
        const favoriteStations = snapshot.docs.map((doc) => doc.data());
        setFavorites(favoriteStations);
      },
      (error) => {
        console.error('Firebase error:', error.message);
        showToast('Error fetching favorites from Firebase.');
      }
    );

    return () => {
      sound.current.unloadAsync();
      clearInterval(intervalObj);
      unsubscribeFavorites();
    };
  }, []);

  useEffect(() => {
    setCurrentAudioFile(audioFile);
    setCurrentIndex(index);
    setIsMusic(!audioFile.isRadio); // Check if it's music
    setIsRadio(audioFile.isRadio);
    setIsRadioName(audioFile.name);

    if (audioFile.isRadio) {
      // Reset values when isRadio becomes true in the route params
      setIsPlaying(false);
      setIsSeeking(false);
      setPosition(0);
      setDuration(0);
      setCurrentRadioIndex(RadioIndex); // You may or may not want to set this value based on your requirement
      loadSound(audioFile.uri, true);
    } else {
      loadSound(audioFile.uri);
    }
  }, [audioFile, index, audioFiles, RadioIndex, radioStations]);

  useEffect(() => {
    let intervalObj;

    const updatePosition = async () => {
      if (sound.current && !isSeeking) {
        const status = await sound.current.getStatusAsync();
        setPosition(status.positionMillis);
        setIsPlaying(status.isPlaying);

        if (status.positionMillis >= status.durationMillis) {
          if (isRepeatEnabled) {
            // If repeat is enabled, replay the current audio
            await sound.current.replayAsync();
            setIsPlaying(true);
          } else {
            // Check if the duration is greater than 1 before proceeding to the next track
            if (status.durationMillis > 1) {
              handleNext();
            } else {
              // If duration is less than or equal to 1, and the radio is playing,
              // do not trigger handleNext, but keep playing the radio.
              setIsPlaying(true);
            }
          }
        }
      }
    };

    if (isPlaying) {
      intervalObj = setInterval(updatePosition, 1000);
      setIntervalObj(intervalObj);
    } else {
      clearInterval(intervalObj);
    }

    return () => {
      clearInterval(intervalObj);
    };
  }, [isSeeking, isPlaying, isRepeatEnabled]);

  const sound = useRef(new Audio.Sound());
  const loadSound = async (uri, shouldPlay = true) => {
    try {
      console.log('Loading sound...');
      await sound.current.unloadAsync();

      const { sound: loadedSound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: shouldPlay }
      );
      sound.current = loadedSound;
      setIsPlaying(shouldPlay);
      setDuration(status.durationMillis);

      // Update the current audio URL only when it's different
      if (currentAudioUrl !== uri) {
        setCurrentAudioUrl(uri);
        // Update the current audio file metadata
        if (audioFiles) {
          const audioIndex = audioFiles.findIndex((audio) => audio.uri === uri);
          setCurrentAudioFile(audioFiles[audioIndex]);
        }
      }

      console.log('Sound loaded successfully. Duration:', status.durationMillis);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };




  const toggleFavorite = async () => {
    try {
      const stationRef = firebase.firestore().collection('Favorites');
      if (isFavorite()) {
        // Remove station from favorites
        await stationRef.where('Name', '==', RadioName)
          .where('url', '==', currentAudioUrl)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              doc.ref.delete();
            });
          });
      } else {
        // Add station to favorites
        await stationRef.add({
          Name: RadioName,
          url: currentAudioUrl,
        });
      }
    } catch (error) {
      console.error('Error adding/removing station from favorites:', error.message);
    }
  };

  const isFavorite = () => {
    return favorites.some((fav) => fav.Name === RadioName && fav.url === currentAudioUrl);
  };


  const handlePlayPause = async () => {
    try {
      if (sound.current) {
        const { isPlaying } = await sound.current.getStatusAsync();
        if (isPlaying) {
          await sound.current.pauseAsync();
        } else {
          await sound.current.playAsync();
        }
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleStop = async () => {
    try {
      if (sound.current) {
        await sound.current.stopAsync();
        setIsPlaying(false);
        setIsSeeking(false);
        setPosition(0);
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const handleNext = async () => {
    // Handling radio stations
    if (Radio) {
      const nextIndex = currentRadioIndex + 1;
      if (nextIndex < radioStations.length) {
        const nextStation = radioStations[nextIndex];
        setCurrentRadioIndex(nextIndex);
        setIsPlaying(false);
        loadSound(nextStation.url);
        setIsRadioName(nextStation.Name); // Update the radio name
      } else {
        console.log('This is the last radio station.');
      }
    } else {
      // Handling regular audio tracks
      let nextIndex;
      if (isShuffleEnabled) {
        nextIndex = Math.floor(Math.random() * audioFiles.length);
      } else {
        nextIndex = currentIndex + 1;
      }

      if (nextIndex < audioFiles.length) {
        const nextAudioFile = audioFiles[nextIndex];
        setCurrentIndex(nextIndex); 
        setIsPlaying(false);
        setIsRadioName(null); // Set radio name to null for regular audio tracks
        loadSound(nextAudioFile.uri);
      } else {
        console.log('This is the last audio track.');
      }
    }
  };


  const handlePrevious = async () => {
    // Handling radio stations
    if (Radio) {
      const previousIndex = currentRadioIndex - 1;
      if (previousIndex >= 0) {
        const previousStation = radioStations[previousIndex];
        setCurrentRadioIndex(previousIndex); 
        setIsPlaying(false);
        loadSound(previousStation.url);
        setIsRadioName(previousStation.Name); // Update the radio name
      } else {
        console.log('This is the first radio station.');
      }
    } else {
      // Handling regular audio tracks
      const previousIndex = currentIndex - 1;
      if (previousIndex >= 0) {
        const previousAudioFile = audioFiles[previousIndex];
        setCurrentIndex(previousIndex); 
        setIsPlaying(false);
        setIsRadioName(null); // Set radio name to null for regular audio tracks
        loadSound(previousAudioFile.uri);
      } else {
        console.log('This is the first audio track.');
      }
    }
  };

  const handleSliderValueChange = (value) => {
    setPosition(value);
  };

  const handleSliderSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleSliderSlidingComplete = async (value) => {
    setIsSeeking(false);

    if (sound.current) {
      try {
        setPosition(value);
        await sound.current.setPositionAsync(value);

        if (isPlaying) {
          await sound.current.playAsync();
        }
      } catch (error) {
        console.error('Error updating audio position:', error);
      }
    }
  };

  const formatTime = (timeInMillis) => {
    const timeInSeconds = timeInMillis / 1000;
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.musicIconContainer}>
        <MusicNoteIcon size={100} color="#f1304d" />
        {isMusic ? ( // Display music-specific information
          <View>
            <Text style={styles.audioName}>Name: {currentAudioFile.fileName}</Text>
            <Text style={styles.audioName}>Title: {currentAudioFile.title}</Text>
            <Text style={styles.audioName}>Artist: {currentAudioFile.artist}</Text>
          </View>
        ) : ( // Display radio-specific information
          <View>
            <Text style={styles.radioName}>Playing: {RadioName}</Text>
            {/* <IconButton icon={isFavorite() ? FavoriteIcon : FavoriteBorderIcon} onPress={toggleFavorite} /> */}
          </View>
        )}
      </View>

      <Text style={styles.simpleText}>Status: {isPlaying ? 'Playing' : 'Paused'}</Text>

      <Slider
        style={{ width: '80%', height: 40 }}
        value={position}
        minimumValue={0}
        maximumValue={duration}
        minimumTrackTintColor="#f1304d"
        maximumTrackTintColor="#000000"
        thumbTintColor="#f1304d"
        onValueChange={handleSliderValueChange}
        onSlidingStart={handleSliderSlidingStart}
        onSlidingComplete={handleSliderSlidingComplete}
        disabled={isSliderDisabled}
      />
      <Text style={styles.simpleText}>
        {formatTime(position)} / {formatTime(duration)}
      </Text>

      <View style={styles.controls}>
        <IconButton icon={isRepeatEnabled ? RepeatIcon : RepeatOffIcon} onPress={() => setIsRepeatEnabled(!isRepeatEnabled)} />
        <IconButton icon={PreviousIcon} onPress={handlePrevious} />
        <IconButton icon={isPlaying ? PauseIcon : PlayIcon} onPress={handlePlayPause} />
        <IconButton icon={NextIcon} onPress={handleNext} />
        <IconButton icon={isShuffleEnabled ? ShuffleIcon : ShuffleOffIcon} onPress={() => setIsShuffleEnabled(!isShuffleEnabled)} />
        <IconButton icon={isFavorite() ? FavoriteIcon : FavoriteBorderIcon} onPress={toggleFavorite} />
      </View>
      <View style={styles.controls}>
      <IconButton icon={StopIcon} onPress={handleStop} />
      </View>
    </View>
  );
};



export default Player;
