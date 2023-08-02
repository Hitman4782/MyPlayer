import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Animated, Alert, Modal, TextInput, ActivityIndicator, ToastAndroid } from 'react-native';
import { Searchbar, Menu } from 'react-native-paper';
import { firebase } from '../../components/firebase';
import { Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from "../../components/ThemeContext"
import { getStyles } from './styles';

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
  
  const { theme, toggleTheme } = useTheme();
  const styles = getStyles(theme);
  

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
      setNewMusicName('');
      setNewMusicUrl('');
      Alert.alert('Success', 'New Music station added!');
      setModalVisible(false); 
    } catch (error) {
      console.error('Error adding station:', error.message);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // const showMenu = (station) => {
  //   setSelectedStation(station);
  //   setVisible(true);
  // };

//  const hideMenu = () => setVisible(false);

  // const handleShare = async () => {
  //   if (selectedStation) {
  //     const { Name, Location, url } = selectedStation;
  //     try {
  //       const result = await Share.share({
  //         message: `Check out this URL:\n${Name}\nURL: ${url}`,
  //       });
  //       if (result.action === Share.sharedAction) {
  //         if (result.activityType) {
  //           // Shared via activity type (e.g. WhatsApp)
  //         } else {
  //           // Shared
  //         }
  //       } else if (result.action === Share.dismissedAction) {
  //         // Dismissed
  //       }
  //     } catch (error) {
  //       console.error('Error sharing:', error.message);
  //     }
  //   }
  //   hideMenu();
  // };

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
    key={index}
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
         <Text style={styles.Title}>Your Playlist</Text>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search Music"
          onChangeText={handleSearch}
          value={searchQuery}
          style={{
            backgroundColor: theme.cardBackground,
          }}
          placeholderTextColor={theme.textColor}
          iconColor={theme.textColor}
          inputStyle={{ color: theme.textColor }}
        />
      </View>

      {loading ? (
        <ActivityIndicator color="#f1304d" size="large" />
      ) : (
        <FlatList
          data={filteredMusicStations} 
          keyExtractor={(item, index) => index.toString()}
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
              <Text style={styles.modalTitle}>Add your Favorite Stream URL</Text>
            </View>
            <View style={styles.modalContent}>
              <TextInput
               style={[styles.input, { backgroundColor: theme.inputColor, color: theme.textColor }]}
                placeholder="Name"
                value={newMusicName}
                onChangeText={setNewMusicName}
                placeholderTextColor="#CCCEDE"
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputColor, color: theme.textColor }]}
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



export default FavoriteScreen;