import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Animated, Alert, Modal, TextInput, ActivityIndicator, ToastAndroid  } from 'react-native';
import { Searchbar, Menu, Divider } from 'react-native-paper';
import { firebase } from '../components/firebase';
import { Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

const FavoriteScreen = ({ navigation }) => {
  const [MusicStations, setMusicStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [newMusicName, setNewMusicName] = useState('');
  const [newMusicUrl, setNewMusicUrl] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const unsubscribe = firebase.firestore().collection('Favorites').onSnapshot(
      (snapshot) => {
        const stations = snapshot.docs.map((doc) => doc.data());
        setMusicStations(stations);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase error:', error.message);
        showToast('Error fetching data from Firebase.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        showToast('Please check your internet connection.');
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleStartPlaying = (url, name, index,) => {
    if (url) {
      navigation.navigate('Player', {
        audioFile: { uri: url, isRadio: true, name: name },
        RadioIndex: index,
        radioStations: filteredMusicStations, 
      });
    }
  };

  const handleAddStation = async () => {
    try {
      await firebase.firestore().collection('Favorites').add({
        Name: newMusicName,
        url: newMusicUrl,
      });
      // Clear the input fields after successful addition
      setNewMusicName('');
      setNewMusicUrl('');
      Alert.alert('Success', 'New Music station added!');
      setModalVisible(false); // Hide the modal after successful addition
    } catch (error) {
      console.error('Error adding station:', error.message);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const showMenu = (station) => {
    setSelectedStation(station);
    setVisible(true);
  };

  const hideMenu = () => setVisible(false);

  const handleShare = async () => {
    if (selectedStation) {
      const { Name, Location, url } = selectedStation;
      try {
        const result = await Share.share({
          message: `Check out this URL:\n${Name}\nURL: ${url}`,
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // Shared via activity type (e.g. WhatsApp)
          } else {
            // Shared
          }
        } else if (result.action === Share.dismissedAction) {
          // Dismissed
        }
      } catch (error) {
        console.error('Error sharing:', error.message);
      }
    }
    hideMenu();
  };

  const filteredMusicStations = MusicStations
    .filter(
      (station) =>
        station.Name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((station, index) => ({ ...station, index })); 


  const showAddPopup = () => {
    setShowPopup(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideAddPopup = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowPopup(false));
  };
  
  const renderMusicStationCard = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleStartPlaying(item.url, item.Name, item.index)}
    >
      <View style={styles.MusicInfo}>
        <Text style={styles.cardName}>{item.Name}</Text>
        <Text style={styles.cardLocation}>{item.Location}</Text>
      </View>
      {/* <Menu
        visible={visible && selectedStation && selectedStation.Name === item.Name}
        onDismiss={hideMenu}
        anchor={
          <TouchableOpacity onPress={() => showMenu(item)}>
            <Text style={styles.dots}>...</Text>
          </TouchableOpacity>
        }
      >
        <Menu.Item onPress={handleShare} title="Share" />
      </Menu> */}
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
         <Text style={styles.Title}>Your Favorite Streams</Text>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search Music"
          onChangeText={handleSearch}
          value={searchQuery}
          style={{
            backgroundColor: '#44486A', 
          }}
          placeholderTextColor="#CCCEDE"
          iconColor="#CCCEDE"
          inputStyle={{ color: '#CCCEDE' }}
        />
      </View>

      {loading ? (
        <ActivityIndicator color="#f1304d" size="large" />
      ) : (
        <FlatList
          data={filteredMusicStations} 
          keyExtractor={(item) => item.Name}
          renderItem={renderMusicStationCard}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal visible={showPopup} transparent>
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Music URL</Text>
            </View>
            <View style={styles.modalContent}>
              <TextInput
                style={[styles.input, { backgroundColor: '#44486A', color: '#CCCEDE' }]}
                placeholder="Name"
                value={newMusicName}
                onChangeText={setNewMusicName}
                placeholderTextColor="#CCCEDE"
              />
              <TextInput
                style={[styles.input, { backgroundColor: '#44486A', color: '#CCCEDE' }]}
                placeholder="URL"
                value={newMusicUrl}
                onChangeText={setNewMusicUrl}
                placeholderTextColor="#CCCEDE"
              />
              <TouchableOpacity style={styles.Button} onPress={handleAddStation}>
                <Text style={styles.ButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.Button} onPress={hideAddPopup}>
                <Text style={styles.ButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.addButton} onPress={showAddPopup}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#2D3047",
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#f1304d',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingBottom: 10,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#44486A',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
  },
  MusicInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    color: '#CCCEDE',
    fontWeight: 'bold',
  },
  cardLocation: {
    fontSize: 14,
    color: '#CCCEDE',
  },
  Title: {
    fontSize: 18,
    bottom: 5,
    textAlign: 'center',
    color: '#CCCEDE',
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  dots: {
    fontSize: 24,
    color: '#CCCEDE',
    paddingHorizontal: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2D3047',
    borderRadius: 8,
    padding: 16,
    width: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CCCEDE',
  },
  modalContent: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    marginBottom: 12,
    padding: 8,
    color: '#CCCEDE',
  },
  Button: {
    backgroundColor: '#f1304d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  ButtonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoriteScreen;