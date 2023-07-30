import React, { Component } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { List, Divider } from 'react-native-paper';

class PlayListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playlist: [],
    };
  }

  handleAddToPlaylist = (audioFile) => {
    this.setState((prevState) => ({
      playlist: [...prevState.playlist, audioFile],
    }));
  };

  render() {
    const { playlist } = this.state;

    return (
      <View style={{ backgroundColor: '#2D3047', flex: 1, padding: 10 }}>
        <FlatList
          data={playlist}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <List.Item
              title={`${index + 1}. ${item.fileName}`}
              description={`${item.title} - ${item.artist}\nDuration: ${this.props.formatDuration(
                item.duration
              )}`}
              left={(props) => <List.Icon {...props} icon="music-note" color="#CCCEDE" size={30} />}
              titleStyle={{ color: '#CCCEDE' }}
              descriptionStyle={{ color: '#CCCEDE' }}
            />
          )}
          ItemSeparatorComponent={() => <Divider />}
        />
      </View>
    );
  }
}

export default PlayListScreen;
