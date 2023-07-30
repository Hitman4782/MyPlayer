import React, { Component } from 'react';
import { View, FlatList, Alert, InteractionManager  } from 'react-native';
import { List, Divider, Searchbar, Menu, IconButton } from 'react-native-paper';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import PlayListScreen from './Playlist';

class AudioListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioFiles: [],
      allAudioFiles: [],
      searchQuery: '',
      menuVisible: false, // Track if the menu is visible or not
      selectedAudioFile: null, // Store the selected audio file for the menu
    };
  }

  componentDidMount() {
    this.getAudioFiles();
  }

  handleAddToPlaylist = (audioFile) => {
    // Show the menu when "Add to Playlist" is clicked
    this.setState({ menuVisible: true, selectedAudioFile: audioFile });
  };

  handleMenuClose = () => {
    // Close the menu
    this.setState({ menuVisible: false, selectedAudioFile: null });
  };




  getAudioFiles = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Permission not granted to access media library');
      }

      let media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
      });

      media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: media.totalCount,
      });

      const audioFilesArray = await Promise.all(
        media.assets.map(async (asset) => {
          if (asset.albumId !== 'BUILT-IN') {
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);
            const fileName = decodeURI(fileInfo.uri.split('/').pop());

            return {
              id: asset.id,
              uri: asset.uri,
              fileName,
              title: asset.title ? asset.title : 'Unknown Title',
              artist: asset.artist ? asset.artist : 'Unknown Artist',
              duration: asset.duration ? asset.duration : 0,
            };
          }
        })
      );

      InteractionManager.runAfterInteractions(() => {
        const filteredAudioFilesArray = audioFilesArray.filter((file) => file);
        // Sort the audio files alphabetically by their file names
        filteredAudioFilesArray.sort((a, b) => a.fileName.localeCompare(b.fileName));
        this.setState({ audioFiles: filteredAudioFilesArray, allAudioFiles: filteredAudioFilesArray });
      });
    } catch (error) {
      console.error('Error fetching audio files:', error);
      Alert.alert('Error', 'Failed to fetch audio files. Please check permissions.');
    }
  };


  handlePlayAudio = (audioFile, index) => {
    console.log('Selected Audio File:', audioFile);
    console.log('Selected Index:', index);
    console.log('All Audio Files:', this.state.audioFiles);
    this.props.navigation.navigate('Player', {
      audioFile: {
        ...audioFile,
        name: audioFile.fileName // Add the fileName as Name in the navigation params
      },
      index,
      audioFiles: this.state.audioFiles,
    });
  };

  // Define a memoized version of the renderItem component
  MemoizedListItem = React.memo(({ item, index, menuVisible }) => (
    <List.Item
      title={`${index + 1}. ${item.fileName}`}
      description={`${item.title} - ${item.artist}\nDuration: ${this.formatDuration(item.duration)}`}
      left={(props) => <List.Icon {...props} icon="music-note" color="#CCCEDE" size={30} />}
      onPress={() => this.handlePlayAudio(item, index)}
      titleStyle={{ color: '#CCCEDE' }}
      descriptionStyle={{ color: '#CCCEDE' }}
    />
  ));

  formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  handleSearch = (query) => {
    const { allAudioFiles } = this.state;

    if (query === '') {
      this.setState({ searchQuery: '', audioFiles: allAudioFiles });
    } else {
      const filteredAudioFiles = allAudioFiles.filter(
        (file) =>
          file.fileName.toLowerCase().includes(query.toLowerCase()) ||
          file.title.toLowerCase().includes(query.toLowerCase()) ||
          file.artist.toLowerCase().includes(query.toLowerCase())
      );
      this.setState({ searchQuery: query, audioFiles: filteredAudioFiles });
    }
  };

  render() {
    const { audioFiles, searchQuery, menuVisible  } = this.state;

    return (
      <View style={{ backgroundColor: '#2D3047', flex: 1, padding: 10 }}>
        <Searchbar
          placeholder="Search audio files"
          onChangeText={this.handleSearch}
          value={searchQuery}
          style={{
            backgroundColor: '#44486A',
          }}
          placeholderTextColor="#CCCEDE"
          iconColor="#CCCEDE"
          inputStyle={{ color: '#CCCEDE' }}
        />
        <FlatList
          data={audioFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <this.MemoizedListItem item={item} index={index} menuVisible={menuVisible} /> // Pass menuVisible as a prop
          )}
          ItemSeparatorComponent={() => <Divider />}
        />
      </View>
    );
  }
}

export default AudioListScreen;
