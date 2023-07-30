import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { PlayIcon, PauseIcon, StopIcon, NextIcon, PreviousIcon, MusicNoteIcon, RepeatIcon, RepeatOffIcon, ShuffleIcon, ShuffleOffIcon } from '../components/Icon';

const Player = ({ route }) => {
  const { audioFile, index, audioFiles, RadioIndex,  radioStations } = route.params || {};
  //console.log(RadioIndex);
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

  const sound = useRef(new Audio.Sound());
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

  useEffect(() => {
    setCurrentAudioFile(audioFile);
    setCurrentIndex(index);
    setIsMusic(!audioFile.isRadio); // Check if it's music
    setIsRadio(audioFile.isRadio);
    setIsRadioName(audioFile.name);
    console.log(RadioName);

    if (audioFile.isRadio) {
      loadSound(audioFile.uri, true);
    } else {
      loadSound(audioFile.uri);
    }

    return () => {
      sound.current.unloadAsync();
      clearInterval(intervalObj);
    };
  }, [audioFile, index, audioFiles]);

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
        setCurrentRadioIndex(nextIndex); // Update the current radio station index
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
        setCurrentIndex(nextIndex); // Update the current regular audio track index
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
        setCurrentRadioIndex(previousIndex); // Update the current radio station index
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
        setCurrentIndex(previousIndex); // Update the current regular audio track index
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
          <Text style={styles.radioName}>Playing: {RadioName}</Text>
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
      </View>
      <IconButton icon={StopIcon} onPress={handleStop} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#2D3047",
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 20,
  },
  musicIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioName: {
    fontSize: 18,
    color: '#CCCEDE',
    fontWeight: 'bold',
    marginTop: 10,
  },
  audioName: {
    color: '#CCCEDE',
    marginTop: 10,
    fontSize: 16,
    paddingHorizontal: 50,
  },
  simpleText: {
    color: '#CCCEDE',
    marginTop: 10,
    paddingHorizontal: 50,
  },
});

export default Player;
